import {Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {Test} from "../../../../../model/test";
import {Bitumen} from "../../../../../model/bitumen";
import {Superpave} from "../../../../../model/superpave";
import {SuperpaveGradation} from "../../../../../model/superpave-gradation";
import {SuperpaveService} from "../../../../../service/superpave/superpave.service";

@Component({
  selector: 'app-insert-superpave',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './insert-superpave.component.html',
  styleUrl: './insert-superpave.component.css'
})
export class InsertSuperpaveComponent {

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
    bitumen: {standard: 'ASTM D2172/D2172M-17e1', equipmentUsed: ''} as Bitumen,
    superpaveGradation: {
      standard: 'ASTM D2172/D2172M-17e1',
      jmfA: '100', jmfB: '100', jmfC: '100', jmfD: '90--98', jmfE: '',
      jmfF: '51.3--61.3', jmfG: '36.2--44.2', jmfH: '', jmfI: '', jmfJ: '',
      jmfK: '5.1--10.1', jmfL: '3.3--6.3', jmfM: '',
      controlPointA: '100', controlPointB: '100', controlPointC: '100',
      controlPointD: '90-100', controlPointE: '90 max', controlPointF: '',
      controlPointG: '28-58', controlPointH: '', controlPointI: '', controlPointJ: '',
      controlPointK: '', controlPointL: '2--10', controlPointM: ''
    } as SuperpaveGradation,
    gmmNiniLimits: '89 Max',
    gmmNdesLimits: '94.5-97.5',
    gmmNmaxLimits: '98 Max',
    airvoidsLimits: '2.5 - 5.5',
    vmaLimits: '12-14',
    vfLimits: '65 - 75',
    dpLimits: '0.6-1.2',
    bitumencontentLimits: '4.3 ± 0.4',
    requestDescription: 'Super Pave test (BWC)'
  } as Superpave;

  constructor(private router: Router,
              private service: SuperpaveService,
              private activatedRoute: ActivatedRoute) {
  }

  insert() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.superpave.test.id = this.id;
    this.service.insert(this.superpave).subscribe(
      () => this.router.navigateByUrl(`/superpave/${this.id}`));
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
