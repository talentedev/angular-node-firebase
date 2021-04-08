import { MdbTablePaginationComponent, MdbTableDirective } from 'angular-bootstrap-md';
import { Component, OnInit, Input, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, AfterViewInit {

  @ViewChild(MdbTablePaginationComponent) mdbTablePagination: MdbTablePaginationComponent;
  @ViewChild(MdbTableDirective) mdbTable: MdbTableDirective;
  @Input() transactions: any[];
  failReason = '';
  elements: any = [];
  previous: any = [];
  headElements = ['Date', 'Charity', 'Payment Method', 'Schedule', 'Amount'];

  constructor(private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.elements = this.transactions.sort((a, b) => b.created - a.created);
    this.mdbTable.setDataSource(this.elements);
    this.elements = this.mdbTable.getDataSource();
    this.previous = this.mdbTable.getDataSource();
  }

  ngAfterViewInit() {
    this.mdbTablePagination.setMaxVisibleItemsNumberTo(10);

    this.mdbTablePagination.calculateFirstItemIndex();
    this.mdbTablePagination.calculateLastItemIndex();
    this.cdRef.detectChanges();
  }

  showFailReason(transaction, modal) {
    if (transaction.status === 'fail') {
      this.failReason = transaction.msg;
      modal.show();
    }
  }

}
