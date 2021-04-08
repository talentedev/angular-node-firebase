import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  title = 'Contact Us | Allgive.org';
  faSpinner = faSpinner;
  firstName;
  lastName;
  email;
  phone;
  message;
  sending = false;
  success = false;

  constructor( private titleService: Title, private userService: UserService, private authService: AuthService ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.setTitle(this.title);
    setTimeout(() => {
      this.email = this.authService.authState.email;
      this.firstName = this.authService.authState.firstName;
      this.lastName = this.authService.authState.lastName;
    }, 1000);
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  sendEmail() {
    if (this.email && this.message) {
      this.sending = true;
      this.success = false;
      const data = {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        message: this.message
      };
      this.userService.sendEmailForContact(data).subscribe((res) => {
        this.sending = false;
        this.success = true;
      });
    }
  }
}
