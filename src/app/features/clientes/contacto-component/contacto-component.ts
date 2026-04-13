import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteTopNavComponent } from '../../../shared/cliente-top-nav/cliente-top-nav.component';

@Component({
  selector: 'app-contacto-component',
  standalone: true,
  imports: [CommonModule, RouterModule, ClienteTopNavComponent],
  templateUrl: './contacto-component.html',
  styleUrl: './contacto-component.css',
})
export class ContactoComponent {}
