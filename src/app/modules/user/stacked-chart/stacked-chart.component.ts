import { Component, OnInit, Input } from '@angular/core';

import { ChartService } from '../../../core/services/chart.service';
import { ContentfulService } from '../../../core/services/contentful.service';

@Component({
  selector: 'app-stacked-chart',
  templateUrl: './stacked-chart.component.html',
  styleUrls: ['./stacked-chart.component.scss']
})
export class StackedChartComponent implements OnInit {

  @Input() dataset: any;

  yAxisMax;
  render = false;

  public chartType = 'bar';
  public chartDatasets: Array<any> = [];
  public chartLabels: Array<any> = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  public chartColors: Array<any> = [];
  public chartOptions = {};
  public chartClicked(e: any): void { }
  public chartHovered(e: any): void { }

  constructor(private contentfullService: ContentfulService) { }

  ngOnInit() {
    this.convertChartData(this.dataset).then(dataset => {
      this.chartDatasets = dataset;
      this.yAxisMax = Math.round(this.getMaxValue(this.chartDatasets) * 120) / 100;
      this.chartOptions = {
        responsive: true,
          scales: {
            xAxes: [{
              stacked: true
              }],
            yAxes: [
            {
              stacked: true,
              ticks: {
                suggestedMax: this.yAxisMax,
                // Include a dollar sign in the ticks
                callback: function(value, index, values) {
                  if (value === 0) {
                    return '';
                  }
                  return '$' + value.toFixed(2);
                }
              }
            }
          ]
        },
        maintainAspectRatio: false,
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              let label = data.datasets[tooltipItem.datasetIndex].label || '';
              if (label) {
                  label += ': ';
              }
              label += '$' + Math.round(tooltipItem.yLabel * 100) / 100;
              return label;
            }
          }
        }
      };
      this.render = true;
    })
  }

  async convertChartData(data) {
    const trans = data.reduce(function (r, a) {
      r[a.product] = r[a.product] || [];
      r[a.product].push(a);
      return r;
    }, Object.create(null));

    const chartData = [];
    this.chartColors = [];
    for (const key in trans) {
      const item = {
        label: key,
        data: this.getDataset(trans[key])
      };
      chartData.push(item);
      const charity = await this.contentfullService.getCharityByName(key);
      this.chartColors.push(this.getColorSet(charity? charity.bgColor: '#ffffff'));
    }

    return chartData;
  }

  getDataset(data) {
    const dataset = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < data.length; ++i) {
      const date = new Date(data[i].created * 1000);
      const month = date.getMonth();
      dataset[month] += data[i].amount / 100;
    }
    return dataset;
  }

  getMaxValue(dataset) {
    const data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < dataset.length; ++i) {
      const values = dataset[i].data;
      for (let j = 0; j < values.length; ++j) {
        data[j] += values[j];
      }
    }
    return Math.max(...data);
  }

  getColorSet(data) {
    const color = {
      backgroundColor: data, //.replace(')', ',0.8)'),
      borderColor: data,
      borderWidth: 2
    };
    return color;
  }
}
