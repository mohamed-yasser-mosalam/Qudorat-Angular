import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {Test} from "../../../../../model/test";
import {Bitumen} from "../../../../../model/bitumen";
import {Superpave} from "../../../../../model/superpave";
import {SuperpaveGradation} from "../../../../../model/superpave-gradation";
import {SuperpaveService} from "../../../../../service/superpave/superpave.service";

@Component({
  selector: 'app-update-superpave',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './update-superpave.component.html',
  styleUrl: './update-superpave.component.css'
})
export class UpdateSuperpaveComponent implements OnInit {

  id: number = 0;
  currentStep = 1;
  sieves = [
    {key: 'A', size: '1 1/2"'},
    {key: 'B', size: '1"'},
    {key: 'C', size: '3/4"'},
    {key: 'D', size: '1/2"'},
    {key: 'E', size: '3/8"'},
    {key: 'F', size: 'No. 4'},
    {key: 'G', size: 'No. 8'},
    {key: 'H', size: 'No. 16'},
    {key: 'I', size: 'No. 30'},
    {key: 'J', size: 'No. 50'},
    {key: 'K', size: 'No. 100'},
    {key: 'L', size: 'No. 200'},
    {key: 'M', size: 'Pan'}
  ];

  superpave: Superpave = {
    test: {} as Test,
    bitumen: {} as Bitumen,
    superpaveGradation: {} as SuperpaveGradation
  } as Superpave;

  constructor(private router: Router,
              private service: SuperpaveService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.service.findById(this.id).subscribe(res => {
      this.superpave = res;
      if (!this.superpave.bitumen) {
        this.superpave.bitumen = {} as Bitumen;
      }
      if (!this.superpave.superpaveGradation) {
        this.superpave.superpaveGradation = {} as SuperpaveGradation;
      }
      const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
      for (const key of keys) {
        const expandKey = `expand${key}`;
        if (!this.superpave.superpaveGradation[expandKey] || this.superpave.superpaveGradation[expandKey] === '\u0000') {
          this.superpave.superpaveGradation[expandKey] = '';
        }
      }
    });
  }

  update() {
    this.service.update(this.superpave, this.id).subscribe(
      () => this.router.navigateByUrl(`/tests`));
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  limitLiness(event: Event, maxLines: number) {
    const textarea = event.target as HTMLTextAreaElement;
    const lines = textarea.value.split('\n');
    if (lines.length > maxLines) {
      textarea.value = lines.slice(0, maxLines).join('\n');
      this.superpave.notes = textarea.value;
    }
  }
}
