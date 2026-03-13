import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Esto soluciona el error NG8004 del pipe 'number'

interface PizzaSize {
  name: string;
  cm: string;
  price: number;
}

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule],
  // Aquí ajusté los nombres para que coincidan con tus archivos reales y solucionar el error NG2008
  templateUrl: './producto-detalle-component.html', 
  styleUrls: ['./producto-detalle-component.css'] 
})
export class ProductoDetalleComponent {
  productName = 'Conjuntos de cuatro lunas';
  basePrice = 110.00;
  description = 'Mozzarella, gorgonzola, parmesano envejecido, provolone';
  
  ingredients: string[] = [
    'Mozzarella.',
    'Gorgonzola dolce.',
    'Parmesano Reggiano.',
    'Provolone ahumado.',
    'Miel de trufa.'
  ];

  sizes: PizzaSize[] = [
    { name: 'Individual', cm: '30 cm', price: 70 },
    { name: 'Mediana', cm: '35 cm', price: 90 },
    { name: 'Grande', cm: '40 cm', price: 110 },
    { name: 'Familiar', cm: '45 cm', price: 130 }
  ];

  selectedSize: PizzaSize = this.sizes[0]; 
  quantity: number = 1;

  selectSize(size: PizzaSize) {
    this.selectedSize = size;
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  get total(): number {
    return this.selectedSize.price * this.quantity;
  }
}