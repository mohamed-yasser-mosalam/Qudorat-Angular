import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {SearchComponent} from "../../../shared/search/search.component";
import {SearchPipe} from "../../../../pipe/search.pipe";
import {Test} from "../../../../model/test";
import {TestService} from "../../../../service/test/test.service";
import {AuthenticationService} from "../../../../service/authentication/authentication.service";

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink,
    SearchComponent,
    SearchPipe,
    NgIf
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {

  tests: Test[] = [];
  searchText: string = '';
  role: string = '';
  id: string | null = '';

  constructor(private service: TestService, private router: Router, private authService: AuthenticationService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.queryParamMap.get('id');
    if (this.id)
      this.findById(this.id)
    else
      this.findAll();
    this.role = this.authService.getAuthority();
  }

  findAll() {
    this.service.findAll().subscribe(res => this.tests = res);
  }

  findById(id: string) {
    this.service.findOne(id).subscribe({
      next: (response) => {
        if (response) {
          this.tests = [response];
        } else {
          this.findAll();
        }
      },
      error: (err) => {
        this.findAll();
      }
    });
  }

  onSearchTextEntered(searchValue: any) {
    this.searchText = searchValue
  }

  delete(id: number) {
    this.service.delete(id).subscribe();
    this.findAll();
    window.location.reload();
  }

  goToTrail(testId: string | number, managerId: number, managerName: string = '') {
    const name = (managerName || '').toLowerCase();
    const id = String(testId || '');

    if (name.replace(/\s+/g, '').includes('superpave') || id.startsWith('SP-')) {
      this.router.navigate([`/superpave/${testId}`]);
      return;
    }
    if (managerId == 1 || id.startsWith('SO-')) {
      this.router.navigate([`/sands/${testId}`]);
      return;
    }
    if (managerId == 2 || id.startsWith('AM-')) {
      this.router.navigate([`/asphalt/${testId}`]);
      return;
    }
    if (managerId == 3 || id.startsWith('CS-')) {
      this.router.navigate([`/compressive-strength/${testId}`]);
      return;
    }
    if (managerId == 4 || id.startsWith('AL-')) {
      this.router.navigate([`/atterberg/${testId}`]);
      return;
    }
    if (managerId == 5 || id.startsWith('MD-')) {
      this.router.navigate([`/moisture-density-relationship/${testId}`]);
    }
  }

  changeActive(id: number) {
    this.service.changeActive(id, this.authService.getName()).subscribe(() => {
      const test = this.tests.find(t => t.id === id);
      if (test) {
        test.active = !test.active;
      }
    });
  }

  protected readonly TestService = TestService;
}
