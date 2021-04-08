import { Injectable } from '@angular/core';

import { Observable, forkJoin } from 'rxjs';

import { ContentfulService } from './contentful.service';

@Injectable()
export class ChartService {

  constructor(private contentfullService: ContentfulService) { }

  // Return char options with series data and binding method.
  getChartOptions(series, client) {
    const chartOptions = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        backgroundColor: '#e9ecef'
      },
      title: {
        text: ''
      },
      tooltip: {
        pointFormat: '<b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
          },
          showInLegend: false,
          events: {
            click: function(e) {
              client.clickChart(e);
            }.bind(client)
          }
        }
      },
      series: [{
        name: 'Brands',
        colorByPoint: true,
        data: series,
        point: {
          events: {
            mouseOver: function(e) {
              client.selectedOrg = e.target.index;
            }.bind(client),
            mouseOut: function(e) {
              client.selectedOrg = -1;
            }.bind(client)
          }
        }
      }],
      credits: {
        enabled: false
      }
    };
    return chartOptions;
  }

  // Calculate total donation amount.
  calTotalDonation(data) {
    let totalDonation = 0;
    for (let i = 0; i < data.length; ++i) {
      totalDonation += data[i].ytd;
    }
    return totalDonation;
  }

  // Calculate total donation amount.
  getTotalDonationAmount(data) {
    let totalDonation = 0;
    if (!data) {
      data = [];
    }
    for (let i = 0; i < data.length; ++i) {
      totalDonation += data[i].amount;
    }
    return totalDonation === 0 ? 0 : totalDonation / 100;
  }

  // Convert donation data.
  processDonations(donations, transactions) {
    const trans = transactions.reduce(function (r, a) {
      r[a.product] = r[a.product] || [];
      r[a.product].push(a);
      return r;
    }, Object.create(null));

    const donationOrgs = [];
    return new Promise((resolve, reject) => {
      this.contentfullService.getAllCharities().subscribe(res => {
        const charities = Object.values(res);
        donations.forEach(donation => {
          const totalAmount = this.getTotalDonationAmount(transactions);
          const yearAmount = this.getTotalDonationAmount(trans[donation.product]);
          const projection = this.calcYearProjection(yearAmount, donation.amount, donation.schedule);
          const relatedCharities = charities.filter(item => item.title === donation.product);
          let bgColor = '#ffffff';
          if (relatedCharities && relatedCharities.length > 0) {
            bgColor = relatedCharities[0].bgColor;
          }
          donationOrgs.push({
            amount : yearAmount,
            projection: projection,
            daily: donation.amount / 100,
            schedule: donation.schedule,
            charityname: donation.product,
            color: bgColor,
            cardId: donation.cardId,
            productId: donation.productId,
            invoices: trans[donation.product],
            subscriptionId: donation.subscriptionId,
          });
        });
        resolve(donationOrgs);
      });
    });
  }

  // Calculate the projection amount for a year
  calcYearProjection(yearAmount, amount, schedule) {
    let projection = yearAmount;
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    const todayStr = mm + '/' + dd + '/' + yyyy;
    const endDate = '12/31/' + yyyy;

    const date1 = new Date(todayStr);
    const date2 = new Date(endDate);
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const diffWeek = Math.ceil(diffDays / 7);
    const diffMonth = Math.ceil(diffDays / 30);
    const diffYear = Math.ceil(diffDays / 365);
    switch (schedule) {
      case 'day': projection += amount * diffDays / 100; break;
      case 'week': projection += amount * diffWeek / 100; break;
      case 'month': projection += amount * diffMonth / 100; break;
      case 'year': projection += amount * diffYear / 100; break;
    }
    return Math.round(projection * 100) / 100;
  }

  // Calculate total year projection.
  calTotalProjection(data) {
    let total = 0;
    for (let i = 0; i < data.length; ++i) {
      total += data[i].projection;
    }
    return total;
  }

  // Get charitiy logo
  getCharityLogo(data): Observable<any[]> {
    const responses = [];

    for (let i = 0; i < data.length; ++i) {
      responses.push(this.contentfullService.getCharityByName(data[i].charityname));
    }
    return forkJoin(responses);
  }
}
