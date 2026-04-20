import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CloudinaryService } from '../../../core/services/cloudinary';
import { finalize, of, switchMap } from 'rxjs';
import { ConfirmService } from '../../../shared/confirm/confirm.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { AuthService } from '../../../core/services/auth';
import {
  PromocionesService,
  type Promocion,
  type PromocionCreatePayload,
  type PromocionUpdatePayload,
} from '../../../core/services/promociones.service';
import { TecnicoAdminNavComponent } from '../../../shared/tecnico-admin-nav/tecnico-admin-nav.component';

@Component({
  selector: 'app-promociones-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TecnicoAdminNavComponent],
  templateUrl: './promociones-admin-component.html',
  styleUrls: ['./promociones-admin-component.css'],
})
export class PromocionesAdminComponent implements OnInit {
  private readonly promociones = inject(PromocionesService);
  private readonly cloudinary = inject(CloudinaryService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  lista: Promocion[] = [];
  termino = '';

  nueva: PromocionCreatePayload = {
    titulo: '',
    descripcion: '',
    contenido: '',
    imagenURL: '',
    precioOriginal: 0,
    precioPromocional: 0,
    tipoVigencia: 0,
    fechaValidaHasta: null,
    diaSemanaRecurrente: null,
    activo: true,
  };

  edit: (PromocionUpdatePayload & { idPromocion: number }) | null = null;

  isUploadingNuevo = false;
  isUploadingEdit = false;
  private fileNuevo: File | null = null;
  private fileEdit: File | null = null;
  nuevoPreviewUrl: string | null = null;
  editPreviewUrl: string | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  private normalizeCreatePayload(raw: PromocionCreatePayload): PromocionCreatePayload | null {
    const tipo = Number(raw.tipoVigencia);
    if (tipo === 0) {
      const fecha = (raw.fechaValidaHasta ?? '').toString().trim();
      if (!fecha) {
        this.toast.show('FechaValidaHasta es requerida para vigencia por fecha.', 'info');
        return null;
      }
      return {
        ...raw,
        tipoVigencia: 0,
        fechaValidaHasta: fecha,
        diaSemanaRecurrente: null,
      };
    }
    if (tipo === 1) {
      const dia = raw.diaSemanaRecurrente;
      const diaNum = dia === null || dia === undefined || dia === ('' as any) ? NaN : Number(dia);
      if (!Number.isFinite(diaNum) || diaNum < 0 || diaNum > 6) {
        this.toast.show('DiaSemanaRecurrente debe ser un número entre 0 y 6.', 'info');
        return null;
      }
      return {
        ...raw,
        tipoVigencia: 1,
        fechaValidaHasta: null,
        diaSemanaRecurrente: diaNum,
      };
    }

    this.toast.show('TipoVigencia no válido. Usa 0 (Hasta fecha) o 1 (Recurrente por día).', 'info');
    return null;
  }

  private normalizeUpdatePayload(raw: PromocionUpdatePayload): PromocionUpdatePayload | null {
    const tipo = raw.tipoVigencia;
    if (tipo === null || tipo === undefined) return raw;

    const tipoNum = Number(tipo);
    if (tipoNum === 0) {
      const fecha = (raw.fechaValidaHasta ?? '').toString().trim();
      if (!fecha) {
        this.toast.show('FechaValidaHasta es requerida para vigencia por fecha.', 'info');
        return null;
      }
      return {
        ...raw,
        tipoVigencia: 0,
        fechaValidaHasta: fecha,
        diaSemanaRecurrente: null,
      };
    }
    if (tipoNum === 1) {
      const dia = raw.diaSemanaRecurrente;
      const diaNum = dia === null || dia === undefined || dia === ('' as any) ? NaN : Number(dia);
      if (!Number.isFinite(diaNum) || diaNum < 0 || diaNum > 6) {
        this.toast.show('DiaSemanaRecurrente debe ser un número entre 0 y 6.', 'info');
        return null;
      }
      return {
        ...raw,
        tipoVigencia: 1,
        fechaValidaHasta: null,
        diaSemanaRecurrente: diaNum,
      };
    }

    this.toast.show('TipoVigencia no válido. Usa 0 (Hasta fecha) o 1 (Recurrente por día).', 'info');
    return null;
  }

  cargar(): void {
    this.promociones.obtenerPromocionesAdmin().subscribe({
      next: (data) => {
        this.lista = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando promociones', err),
    });
  }

  get filtradas(): Promocion[] {
    const t = this.termino.trim().toLowerCase();
    if (!t) return this.lista;
    return this.lista.filter(
      (p) =>
        p.titulo.toLowerCase().includes(t) ||
        (p.descripcion ?? '').toLowerCase().includes(t) ||
        (p.contenido ?? '').toLowerCase().includes(t),
    );
  }

  abrirNueva(): void {
    new (window as any).bootstrap.Modal(document.getElementById('modalPromoNueva')).show();
  }

  abrirEditar(p: Promocion): void {
    this.edit = {
      idPromocion: p.idPromocion,
      titulo: p.titulo,
      descripcion: p.descripcion ?? null,
      contenido: p.contenido ?? null,
      imagenURL: p.imagenURL ?? null,
      precioOriginal: p.precioOriginal,
      precioPromocional: p.precioPromocional,
      tipoVigencia: p.tipoVigencia,
      fechaValidaHasta: p.fechaValidaHasta ? new Date(p.fechaValidaHasta).toISOString() : null,
      diaSemanaRecurrente: p.diaSemanaRecurrente ?? null,
      activo: p.activo,
    };
    new (window as any).bootstrap.Modal(document.getElementById('modalPromoEditar')).show();
  }

  crear(): void {
    const normalized = this.normalizeCreatePayload(this.nueva);
    if (!normalized) return;

    const upload$ = this.fileNuevo
      ? this.cloudinary.uploadImage(this.fileNuevo, { folder: 'arcanoPizza/promociones' }).pipe(
          switchMap((res) => {
            normalized.imagenURL = res.secure_url;
            this.toast.show('Imagen subida correctamente.', 'success');
            return of(null);
          }),
        )
      : of(null);

    this.isUploadingNuevo = true;
    upload$
      .pipe(
        switchMap(() => this.promociones.crearPromocion(normalized)),
        finalize(() => {
          this.isUploadingNuevo = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          (window as any).bootstrap.Modal.getInstance(document.getElementById('modalPromoNueva'))?.hide();
          this.nueva = {
            titulo: '',
            descripcion: '',
            contenido: '',
            imagenURL: '',
            precioOriginal: 0,
            precioPromocional: 0,
            tipoVigencia: 0,
            fechaValidaHasta: null,
            diaSemanaRecurrente: null,
            activo: true,
          };
          this.fileNuevo = null;
          if (this.nuevoPreviewUrl) URL.revokeObjectURL(this.nuevoPreviewUrl);
          this.nuevoPreviewUrl = null;
          this.cargar();
        },
        error: (err) => console.error('Error creando promoción', err),
      });
  }

  guardar(): void {
    if (!this.edit) return;
    const id = this.edit.idPromocion;
    const { idPromocion, ...payload } = this.edit;
    const normalized = this.normalizeUpdatePayload(payload);
    if (!normalized) return;
    const upload$ = this.fileEdit
      ? this.cloudinary.uploadImage(this.fileEdit, { folder: 'arcanoPizza/promociones' }).pipe(
          switchMap((res) => {
            normalized.imagenURL = res.secure_url;
            if (this.edit) this.edit.imagenURL = res.secure_url;
            this.toast.show('Imagen subida correctamente.', 'success');
            return of(null);
          }),
        )
      : of(null);

    this.isUploadingEdit = true;
    upload$
      .pipe(
        switchMap(() => this.promociones.actualizarPromocion(id, normalized)),
        finalize(() => {
          this.isUploadingEdit = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          (window as any).bootstrap.Modal.getInstance(document.getElementById('modalPromoEditar'))?.hide();
          this.edit = null;
          this.fileEdit = null;
          if (this.editPreviewUrl) URL.revokeObjectURL(this.editPreviewUrl);
          this.editPreviewUrl = null;
          this.cargar();
        },
        error: (err) => console.error('Error actualizando promoción', err),
      });
  }

  async eliminar(p: Promocion): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Eliminar promoción',
      message: `¿Eliminar la promoción "${p.titulo}"?\nEsta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;
    this.promociones.eliminarPromocion(p.idPromocion).subscribe({
      next: () => {
        this.toast.show('Eliminado correctamente.', 'success');
        this.cargar();
      },
      error: (err) => console.error('Error eliminando promoción', err),
    });
  }

  onFileNuevo(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileNuevo = file;
    try {
      this.nuevoPreviewUrl && URL.revokeObjectURL(this.nuevoPreviewUrl);
      this.nuevoPreviewUrl = URL.createObjectURL(file);
    } catch {
      this.nuevoPreviewUrl = null;
    }
    this.cdr.detectChanges();
  }

  onFileEdit(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.edit) return;
    this.fileEdit = file;
    try {
      this.editPreviewUrl && URL.revokeObjectURL(this.editPreviewUrl);
      this.editPreviewUrl = URL.createObjectURL(file);
    } catch {
      this.editPreviewUrl = null;
    }
    this.cdr.detectChanges();
  }

  salir(): void {
    this.auth.logout();
  }
}

