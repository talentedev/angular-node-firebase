import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'schedule'
})
export class SchedulePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    switch (value) {
      case 'day':
        return 'Daily';
        break;
      case 'week':
        return 'Weekly';
        break;
      case 'month':
        return 'Monthly';
        break;
      case 'year':
        return 'Yearly';
        break;
      default:
        return null;
        break;
    }
  }

}
