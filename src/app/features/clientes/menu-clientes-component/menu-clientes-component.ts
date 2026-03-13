import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-menu-clientes-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-clientes-component.html',
  styleUrl: './menu-clientes-component.css',
})

export class MenuClientesComponent {}
