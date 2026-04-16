import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [RouterLink, ClienteTopNavComponent],
  template: `
    <div class="page-container">
      <app-cliente-top-nav />
      <main class="legal-inner">
        <a routerLink="/menu" class="back">← Volver al menú</a>
        <h1>Privacidad</h1>
        <p class="lead">
          Texto orientativo. Ajustá esta política a tu operación y normativa local (INAI / GDPR, etc.).
        </p>
        <section>
          <h2>Datos que recopilamos</h2>
          <p>
            Podemos tratar datos de cuenta (nombre, correo), dirección de entrega, historial de pedidos y datos
            necesarios para procesar pagos a través de la pasarela correspondiente.
          </p>
        </section>
        <section>
          <h2>Uso del sitio</h2>
          <p>
            Usamos la información para procesar pedidos, comunicarnos sobre el estado del servicio y mejorar la
            experiencia. No vendemos datos personales a terceros para fines comerciales ajenos al servicio.
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
export class PrivacidadComponent {}
