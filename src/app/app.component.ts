import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HistoryEntry {
  label: string;
  result: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  display = '0';
  expression = '';
  operator: string | null = null;
  history: HistoryEntry[] = [];
  historyVisible = false;

  onToggleHistory(): void {
    this.historyVisible = !this.historyVisible;
  }

  private firstOperand: number | null = null;
  private waitingForSecond = false;

  onNumber(num: string): void {
    if (this.waitingForSecond) {
      this.display = num;
      this.waitingForSecond = false;
    } else {
      this.display = this.display === '0' ? num : this.display + num;
    }
  }

  onDecimal(): void {
    if (this.waitingForSecond) {
      this.display = '0.';
      this.waitingForSecond = false;
      return;
    }
    if (!this.display.includes('.')) {
      this.display += '.';
    }
  }

  onOperator(op: string): void {
    const current = parseFloat(this.display);
    if (this.firstOperand !== null && !this.waitingForSecond) {
      const result = this.calculate(this.firstOperand, current, this.operator!);
      this.display = this.formatResult(result);
      this.firstOperand = result;
      this.expression = `${this.expression} ${this.formatResult(current)} ${this.opSymbol(op)}`;
    } else {
      this.firstOperand = current;
      this.expression = `${this.formatResult(current)} ${this.opSymbol(op)}`;
    }
    this.operator = op;
    this.waitingForSecond = true;
  }

  onEquals(): void {
    if (this.firstOperand === null || this.operator === null) return;
    const second = this.display;
    const current = parseFloat(second);
    const result = this.calculate(this.firstOperand, current, this.operator);
    const resultStr = this.formatResult(result);
    const label = `${this.expression} ${second} = ${resultStr}`;
    this.history.unshift({ label, result: result });
    this.expression = label;
    this.display = resultStr;
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecond = true;
  }

  onClear(): void {
    this.display = '0';
    this.expression = '';
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecond = false;
  }

  onClearHistory(): void {
    this.history = [];
  }

  onDeleteHistoryEntry(index: number): void {
    this.history.splice(index, 1);
  }

  onLoadFromHistory(entry: HistoryEntry): void {
    this.display = this.formatResult(entry.result);
    this.expression = `Recuperado: ${this.formatResult(entry.result)}`;
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecond = false;
  }

  onToggleSign(): void {
    const val = parseFloat(this.display);
    this.display = this.formatResult(-val);
  }

  onPercent(): void {
    const val = parseFloat(this.display);
    this.display = this.formatResult(val / 100);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if ('0123456789'.includes(key)) {
      this.onNumber(key);
    } else if (key === '.') {
      this.onDecimal();
    } else if (key === '+') {
      this.onOperator('+');
    } else if (key === '-') {
      this.onOperator('-');
    } else if (key === '*') {
      this.onOperator('*');
    } else if (key === '/') {
      event.preventDefault();
      this.onOperator('/');
    } else if (key === 'Enter' || key === '=') {
      this.onEquals();
    } else if (key === 'Backspace') {
      this.onBackspace();
    } else if (key === 'Escape') {
      this.onClear();
    } else if (key === '%') {
      this.onPercent();
    }
  }

  onBackspace(): void {
    if (this.waitingForSecond) return;
    if (this.display.length > 1) {
      this.display = this.display.slice(0, -1);
    } else {
      this.display = '0';
    }
  }

  private opSymbol(op: string): string {
    const map: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return map[op] ?? op;
  }

  private calculate(a: number, b: number, op: string): number {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : NaN;
      default: return b;
    }
  }

  private formatResult(value: number): string {
    if (isNaN(value)) return 'Error';
    return parseFloat(value.toPrecision(10)).toString();
  }
}
