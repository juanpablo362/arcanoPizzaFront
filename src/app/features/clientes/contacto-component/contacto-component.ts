import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contacto-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contacto-component.html',
  styleUrl: './contacto-component.css',
})

export class ContactoComponent { }
