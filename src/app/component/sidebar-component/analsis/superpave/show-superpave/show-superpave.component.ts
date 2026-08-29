import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {Test} from "../../../../../model/test";
import {AuthenticationService} from "../../../../../service/authentication/authentication.service";
import {TestService} from "../../../../../service/test/test.service";
import Swal from "sweetalert2";
import {SuperpaveService} from "../../../../../service/superpave/superpave.service";

@Component({
  selector: 'app-show-superpave',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    RouterLink
  ],
  templateUrl: './show-superpave.component.html',
  styleUrl: './show-superpave.component.css'
})
export class ShowSuperpaveComponent implements OnInit {

  test: Test = {} as Test;
  id: number = 0;
  role: string = '';

  constructor(private authenticationService: AuthenticationService, private router: Router,
              private activatedRoute: ActivatedRoute, private testService: TestService,
              private service: SuperpaveService) {
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.testService.findById(this.id).subscribe(res => {
      this.test = res;
      if (!this.test.superpaves) {
        this.test.superpaves = [];
      }
    });
    this.role = this.authenticationService.getAuthority();
  }

  adopt(id: number) {
    const name = this.authenticationService.getName();
    Swal.fire({
      title: 'Are you sure?',
      text: `This test ${id} will be adopted with user ${name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.testService.adopt(id, name).subscribe(() => {
          Swal.fire('Adopted!', 'The adoption process was successful.', 'success');
          this.router.navigate(['/tests']);
        }, () => {
          Swal.fire('Error!', 'Something went wrong.', 'error');
        });
      }
    });
  }

  reject(id: number) {
    const name = this.authenticationService.getName();
    Swal.fire({
      title: 'Reject Test',
      text: `Please provide a reason for rejecting test ${id}:`,
      input: 'textarea',
      inputPlaceholder: 'Enter rejection comment...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Rejection comment is required!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.testService.reject(id, name, result.value).subscribe(
          () => {
            Swal.fire('Rejected!', 'The test has been rejected successfully.', 'success');
            this.router.navigate(['/tests']);
          },
          () => {
            Swal.fire('Error!', 'Something went wrong.', 'error');
          }
        );
      }
    });
  }

  approve(id: number) {
    const name = this.authenticationService.getName();
    Swal.fire({
      title: 'Are you sure?',
      text: `This test ${id} will be approved with user ${name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.testService.approve(id, name).subscribe(
          () => {
            Swal.fire('Approved!', 'The approval process was successful.', 'success');
            this.router.navigate(['/tests']);
          },
          () => {
            Swal.fire('Error!', 'Something went wrong.', 'error');
          }
        );
      }
    });
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() => {
      this.testService.findById(this.id).subscribe(res => {
        this.test = res;
        if (!this.test.superpaves) {
          this.test.superpaves = [];
        }
      });
    });
  }
}
