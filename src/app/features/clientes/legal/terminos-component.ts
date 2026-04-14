import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [RouterLink, ClienteTopNavComponent],
  template: `
    <div class="page-container">
      <app-cliente-top-nav />
      <main class="legal-inner">
        <a routerLink="/menu-clientes-component" class="back">← Volver al menú</a>
        <h1>Términos y condiciones</h1>
        <p class="lead">
          Texto orientativo. Reemplazá este contenido por los términos legales revisados por un asesor antes de
          producción.
        </p>
        <section>
          <h2>Uso del sitio</h2>
          <p>
            Al usar Arcano Pizza aceptás estos términos. Los precios, productos y horarios pueden variar; la
            información en el sitio es referencial hasta confirmación del pedido.
          </p>
        </section>
        <section>
          <h2>Pedidos y pagos</h2>
          <p>
            Los pedidos se confirman según disponibilidad. Los pagos con tarjeta se procesan mediante proveedores
            seguros; el comprobante y el pedido quedan registrados en tu cuenta cuando corresponda.
          </p>
        </section>
      </main>
    </div>
  `,
  styles: `
    .page-container {
      min-height: 100vh;
      background: radial-gradient(circle at top center, #1a1025, #0b0b12);
      color: var(--arcano-text);
      padding-bottom: 3rem;
    }
    .legal-inner {
      max-width: 640px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 2rem;
    }
    .back {
      display: inline-block;
      margin-bottom: 1rem;
      color: #ffd700;
      text-decoration: none;
    }
    .back:hover {
      text-decoration: underline;
    }
    h1 {
      margin: 0 0 0.75rem;
      font-size: 1.5rem;
      color: #ffd700;
    }
    .lead {
      color: var(--arcano-text-muted);
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    section {
      margin-bottom: 1.25rem;
    }
    h2 {
      font-size: 1.1rem;
      margin: 0 0 0.5rem;
      color: #e8e4f2;
    }
    p {
      margin: 0;
      line-height: 1.55;
      color: var(--arcano-text-soft);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminosComponent {}
