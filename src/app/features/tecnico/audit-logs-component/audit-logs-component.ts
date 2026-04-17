import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';
import {
  AuditLogService,
  type AuditLogItem,
  type PagedAuditLogsResponse,
} from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs-component.html',
  styleUrl: './audit-logs-component.css',
})
export class AuditLogsComponent implements OnInit {
  private readonly auditLogService = inject(AuditLogService);
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);

  items: AuditLogItem[] = [];
  total = 0;
  page = 1;
  pageSize = 25;
  isLoading = false;
  errorMsg: string | null = null;

  desde: string | null = null;
  hasta: string | null = null;
  categoria: string = '';
  nivel: string = '';
  statusCode: number | null = null;
  metodoHttp: string = '';
  ip: string = '';
  usuario: string = '';
  q: string = '';

  expandedDetalle = new Set<number>();

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.isLoading = true;
    this.errorMsg = null;
    const desdeIso = this.desde ? new Date(this.desde).toISOString() : undefined;
    const hastaIso = this.hasta ? new Date(this.hasta).toISOString() : undefined;
    const cat = this.categoria.trim() || undefined;
    const nivel = this.nivel.trim() || undefined;
    const metodoHttp = this.metodoHttp.trim() || undefined;
    const ip = this.ip.trim() || undefined;
    const usuario = this.usuario.trim() || undefined;
    const q = this.q.trim() || undefined;

    this.auditLogService
      .listar(this.page, this.pageSize, {
        desde: desdeIso,
        hasta: hastaIso,
        categoria: cat,
        nivel,
        statusCode: this.statusCode ?? undefined,
        metodoHttp,
        ip,
        usuario,
        q,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res: PagedAuditLogsResponse) => {
          this.items = res.items ?? [];
          this.total = res.total;
          this.page = res.page;
          this.pageSize = res.pageSize;
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'No se pudieron cargar los registros de auditoría.';
          this.items = [];
        },
      });
  }

  totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize) || 1);
  }

  irPrimera(): void {
    if (this.page !== 1) {
      this.page = 1;
      this.cargar();
    }
  }

  irAnterior(): void {
    if (this.page > 1) {
      this.page--;
      this.cargar();
    }
  }

  irSiguiente(): void {
    if (this.page < this.totalPaginas()) {
      this.page++;
      this.cargar();
    }
  }

  irUltima(): void {
    const last = this.totalPaginas();
    if (this.page !== last) {
      this.page = last;
      this.cargar();
    }
  }

  aplicarFiltros(): void {
    this.page = 1;
    this.cargar();
  }

  logout(): void {
    this.auth.logout();
  }

  toggleDetalle(id: number): void {
    if (this.expandedDetalle.has(id)) this.expandedDetalle.delete(id);
    else this.expandedDetalle.add(id);
  }

  isDetalleOpen(id: number): boolean {
    return this.expandedDetalle.has(id);
  }

  copy(text: string | null | undefined): void {
    const value = (text ?? '').trim();
    if (!value) return;
    navigator.clipboard?.writeText(value).catch(() => {});
  }

  nivelClass(nivel: string): string {
    switch (nivel) {
      case 'Error':
        return 'badge-error';
      case 'Warning':
        return 'badge-warn';
      default:
        return 'badge-info';
    }
  }
}
