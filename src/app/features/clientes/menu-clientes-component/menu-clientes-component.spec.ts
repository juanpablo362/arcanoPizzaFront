import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../core/services/auth';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../shared/models/producto.model';
import { MenuClientesComponent } from './menu-clientes-component';

const PRODUCTOS: Producto[] = [
  {
    id: 1,
    nombre: 'Margarita',
    descripcion: 'Salsa y albahaca',
    ingredientes: 'tomate',
    imagenURL: null,
    precio: 120,
    categoriaNombre: 'Pizzas Clásica',
  },
  {
    id: 2,
    nombre: 'Hawaiana',
    descripcion: 'Piña y jamón',
    ingredientes: null,
    imagenURL: null,
    precio: 180,
    categoriaNombre: 'Pizzas especiales',
  },
  {
    id: 3,
    nombre: 'Cola',
    descripcion: 'Refresco',
    ingredientes: null,
    imagenURL: null,
    precio: 30,
    categoriaNombre: 'Bebidas',
  },
];

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('CP-001 Menú del cliente', () => {
  let fixture: ComponentFixture<MenuClientesComponent>;
  let component: MenuClientesComponent;

  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [MenuClientesComponent],
      providers: [
        provideRouter([
          { path: 'menu', component: MenuClientesComponent },
          { path: 'contacto', component: MenuClientesComponent },
          { path: 'carrito', component: MenuClientesComponent },
          { path: 'auth', component: MenuClientesComponent },
          { path: 'promociones', component: MenuClientesComponent },
          { path: 'producto', component: MenuClientesComponent },
        ]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: signal(false),
            user: signal(null),
            logout: () => undefined,
          },
        },
        {
          provide: ProductoService,
          useValue: { obtenerTodos: () => of(PRODUCTOS) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuClientesComponent);
    component = fixture.componentInstance;
  });

  it('muestra el menú público, la barra y el aviso de visita sin cuenta', () => {
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Menú');
    expect(texto).toContain('Contacto');
    expect(texto).toContain('Carrito');
    expect(texto).toContain('Iniciar sesión');
    expect(texto).toContain('Estás viendo el menú sin iniciar sesión');
    expect(component.cargando).toBe(true);
    expect(fixture.nativeElement.querySelector('.skeleton-card')).not.toBeNull();
  });

  it('lista categorías y tarjetas cuando termina la carga del catálogo', async () => {
    fixture.detectChanges();
    await esperar(150);
    fixture.detectChanges();

    expect(component.cargando).toBe(false);
    expect(component.categorias).toEqual(['Pizzas Clásica', 'Pizzas especiales', 'Bebidas']);
    expect(fixture.nativeElement.querySelector('.skeleton-card')).toBeNull();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Margarita');
    expect(texto).toContain('Salsa y albahaca');
    expect(texto).toContain('120.00');
    expect(texto).toContain('Ver detalles');
    expect(texto).not.toContain('Cola');
  });

  it('filtra la cuadrícula al elegir otra categoría', async () => {
    fixture.detectChanges();
    await esperar(150);
    fixture.detectChanges();

    component.seleccionarCategoria('Bebidas');
    fixture.changeDetectorRef.detectChanges();

    const activo = fixture.nativeElement.querySelector('.filter-btn.active') as HTMLButtonElement;
    expect(activo.textContent).toContain('Bebidas');

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Cola');
    expect(texto).not.toContain('Margarita');
    expect(texto).not.toContain('Hawaiana');
  });

  it('avisa cuando la categoría elegida no tiene productos', async () => {
    fixture.detectChanges();
    await esperar(150);
    fixture.detectChanges();

    component.seleccionarCategoria('Postres');
    fixture.changeDetectorRef.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay productos en esta categoría.');
  });

  it('abre el detalle conservando el producto elegido', async () => {
    fixture.detectChanges();
    await esperar(150);

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.abrirDetalle(PRODUCTOS[1]);

    expect(navigate).toHaveBeenCalledWith(['/producto'], { state: { producto: PRODUCTOS[1] } });
  });
});

describe('CP-001 Menú — fallo de catálogo', () => {
  it('quita el esqueleto si GET /Productos falla', async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [MenuClientesComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: signal(false),
            user: signal(null),
            logout: () => undefined,
          },
        },
        {
          provide: ProductoService,
          useValue: { obtenerTodos: () => throwError(() => new Error('API caída')) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MenuClientesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.changeDetectorRef.detectChanges();

    expect(fixture.componentInstance.cargando).toBe(false);
    expect(fixture.nativeElement.querySelector('.skeleton-card')).toBeNull();
  });
});
