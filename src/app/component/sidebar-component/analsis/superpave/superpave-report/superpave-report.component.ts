import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {AuthenticationService} from '../../../../../service/authentication/authentication.service';
import {SuperpaveService} from '../../../../../service/superpave/superpave.service';
import {Superpave} from '../../../../../model/superpave';

declare let AmiriFont: any;

@Component({
  selector: 'app-superpave-report',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './superpave-report.component.html',
  styleUrl: './superpave-report.component.css'
})
export class SuperpaveReportComponent implements OnInit {

  superpave: Superpave = {} as Superpave;
  role = '';
  id = 0;
  loaded = false;

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

  filterSolids = 0;
  totalAgg = 0;
  bitumenWt = 0;
  acPercent = 0;
  ps = 0;

  gmmA = 0;
  gmmB = 0;
  gmmAvg = 0;

  volNdesA = 0;
  volNdesB = 0;
  gmbNdesA = 0;
  gmbNdesB = 0;
  gmbNdesAvg = 0;

  volNmaxA = 0;
  volNmaxB = 0;
  gmbNmaxA = 0;
  gmbNmaxB = 0;
  gmbNmaxAvg = 0;

  pctGmmNdesA = 0;
  pctGmmNdesB = 0;
  pctGmmNdesAvg = 0;
  pctGmmNiniA = 0;
  pctGmmNiniB = 0;
  pctGmmNiniAvg = 0;
  pctGmmNmaxA = 0;
  pctGmmNmaxB = 0;
  pctGmmNmaxAvg = 0;
  pctGmmNdesNmaxA = 0;
  pctGmmNdesNmaxB = 0;
  pctGmmNdesNmaxAvg = 0;
  pctGmmNiniNmaxA = 0;
  pctGmmNiniNmaxB = 0;
  pctGmmNiniNmaxAvg = 0;

  vaNdesA = 0;
  vaNdesB = 0;
  vaNdesAvg = 0;
  vmaNdesA = 0;
  vmaNdesB = 0;
  vmaNdesAvg = 0;
  vfNdesA = 0;
  vfNdesB = 0;
  vfNdesAvg = 0;

  vaNmaxA = 0;
  vaNmaxB = 0;
  vaNmaxAvg = 0;
  vmaNmaxA = 0;
  vmaNmaxB = 0;
  vmaNmaxAvg = 0;
  vfNmaxA = 0;
  vfNmaxB = 0;
  vfNmaxAvg = 0;

  pba = 0;
  pbe = 0;
  dp = 0;
  passing200 = 0;

  constructor(private authenticationService: AuthenticationService,
              private service: SuperpaveService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.role = this.authenticationService.getAuthority();
    this.service.findById(this.id).subscribe(res => {
      this.superpave = res;
      this.compute();
      this.loaded = true;
    });
  }

  fmt(n: number | undefined | null, d = 1): string {
    if (n == null || isNaN(Number(n))) {
      return '';
    }
    return Number(n).toFixed(d);
  }

  zeroBlank(n: number | undefined | null, d = 1): string {
    if (n == null || isNaN(Number(n)) || Number(n) === 0) {
      return '';
    }
    return Number(n).toFixed(d);
  }

  panBlank(key: string, n: number | undefined | null, d = 1): string {
    if (key === 'M' && (!n || Number(n) === 0)) {
      return '';
    }
    return this.fmt(n, d);
  }

  formatDate(value: any): string {
    if (value == null || value === '') {
      return '';
    }
    if (Array.isArray(value) && value.length >= 3) {
      const dd = String(value[2]).padStart(2, '0');
      const mm = String(value[1]).padStart(2, '0');
      return `${dd}/${mm}/${value[0]}`;
    }
    const text = String(value);
    if (text.includes('/')) {
      return text.substring(0, 10);
    }
    const p = text.substring(0, 10).split('-');
    if (p.length === 3) {
      return `${p[2]}/${p[1]}/${p[0]}`;
    }
    return text;
  }

  private safeDiv(num: number, den: number): number {
    if (!den) {
      return 0;
    }
    return num / den;
  }

  private volume(ssd: number, water: number): number {
    return (ssd || 0) - (water || 0);
  }

  private gmb(dry: number, ssd: number, water: number): number {
    return this.safeDiv(dry || 0, this.volume(ssd, water));
  }

  private gmm(a: number, b: number, c: number): number {
    return this.safeDiv(a || 0, (a || 0) + (b || 0) - (c || 0));
  }

  passing(key: string): number {
    const retained = Number(this.superpave.superpaveGradation?.['cumRetained' + key] || 0);
    return this.safeDiv(this.totalAgg - retained, this.totalAgg) * 100;
  }

  cumPassing(key: string): number {
    const retained = Number(this.superpave.superpaveGradation?.['cumRetained' + key] || 0);
    return this.totalAgg - retained;
  }

  private compute() {
    const b = this.superpave.bitumen;
    this.filterSolids = (b?.weightFilterAfter || 0) - (b?.weightFilterBefore || 0);
    this.totalAgg = (b?.weightSampleAfter || 0) + this.filterSolids;
    this.bitumenWt = (b?.weightSampleBefore || 0) - this.totalAgg;
    this.acPercent = this.safeDiv(this.bitumenWt, b?.weightSampleBefore || 0) * 100;
    this.ps = 100 - this.acPercent;

    this.gmmA = this.gmm(this.superpave.netWeightOfLooseMixA, this.superpave.netWeightOfFlaskWaterA, this.superpave.weightFlaskWaterSampleA);
    this.gmmB = this.gmm(this.superpave.netWeightOfLooseMixB, this.superpave.netWeightOfFlaskWaterB, this.superpave.weightFlaskWaterSampleB);
    this.gmmAvg = (this.gmmA + this.gmmB) / 2;

    this.volNdesA = this.volume(this.superpave.weightAirSsdA, this.superpave.weightWaterA);
    this.volNdesB = this.volume(this.superpave.weightAirSsdB, this.superpave.weightWaterB);
    this.gmbNdesA = this.gmb(this.superpave.weightAirDryA, this.superpave.weightAirSsdA, this.superpave.weightWaterA);
    this.gmbNdesB = this.gmb(this.superpave.weightAirDryB, this.superpave.weightAirSsdB, this.superpave.weightWaterB);
    this.gmbNdesAvg = (this.gmbNdesA + this.gmbNdesB) / 2;

    this.volNmaxA = this.volume(this.superpave.weightAirSsdC, this.superpave.weightWaterC);
    this.volNmaxB = this.volume(this.superpave.weightAirSsdD, this.superpave.weightWaterD);
    this.gmbNmaxA = this.gmb(this.superpave.weightAirDryC, this.superpave.weightAirSsdC, this.superpave.weightWaterC);
    this.gmbNmaxB = this.gmb(this.superpave.weightAirDryD, this.superpave.weightAirSsdD, this.superpave.weightWaterD);
    this.gmbNmaxAvg = (this.gmbNmaxA + this.gmbNmaxB) / 2;

    this.pctGmmNdesA = this.safeDiv(this.gmbNdesA, this.gmmAvg) * 100;
    this.pctGmmNdesB = this.safeDiv(this.gmbNdesB, this.gmmAvg) * 100;
    this.pctGmmNdesAvg = (this.pctGmmNdesA + this.pctGmmNdesB) / 2;
    this.pctGmmNiniA = this.pctGmmNdesA * this.safeDiv(this.superpave.heightNdesA, this.superpave.heightNiniA);
    this.pctGmmNiniB = this.pctGmmNdesB * this.safeDiv(this.superpave.heightNdesB, this.superpave.heightNiniB);
    this.pctGmmNiniAvg = (this.pctGmmNiniA + this.pctGmmNiniB) / 2;
    this.pctGmmNmaxA = this.safeDiv(this.gmbNmaxA, this.gmmAvg) * 100;
    this.pctGmmNmaxB = this.safeDiv(this.gmbNmaxB, this.gmmAvg) * 100;
    this.pctGmmNmaxAvg = (this.pctGmmNmaxA + this.pctGmmNmaxB) / 2;
    this.pctGmmNdesNmaxA = this.pctGmmNmaxA * this.safeDiv(this.superpave.heightNmaxC, this.superpave.heightNdesC);
    this.pctGmmNdesNmaxB = this.pctGmmNmaxB * this.safeDiv(this.superpave.heightNmaxD, this.superpave.heightNdesD);
    this.pctGmmNdesNmaxAvg = (this.pctGmmNdesNmaxA + this.pctGmmNdesNmaxB) / 2;
    this.pctGmmNiniNmaxA = this.pctGmmNdesNmaxA * this.safeDiv(this.superpave.heightNdesC, this.superpave.heightNiniC);
    this.pctGmmNiniNmaxB = this.pctGmmNdesNmaxB * this.safeDiv(this.superpave.heightNdesD, this.superpave.heightNiniD);
    this.pctGmmNiniNmaxAvg = (this.pctGmmNiniNmaxA + this.pctGmmNiniNmaxB) / 2;

    this.vaNdesA = this.safeDiv(this.gmmAvg - this.gmbNdesA, this.gmmAvg) * 100;
    this.vaNdesB = this.safeDiv(this.gmmAvg - this.gmbNdesB, this.gmmAvg) * 100;
    this.vaNdesAvg = this.safeDiv(this.gmmAvg - this.gmbNdesAvg, this.gmmAvg) * 100;
    this.vmaNdesA = 100 - this.safeDiv(this.gmbNdesA * this.ps, this.superpave.gsb);
    this.vmaNdesB = 100 - this.safeDiv(this.gmbNdesB * this.ps, this.superpave.gsb);
    this.vmaNdesAvg = (this.vmaNdesA + this.vmaNdesB) / 2;
    this.vfNdesA = this.safeDiv(this.vmaNdesA - this.vaNdesA, this.vmaNdesA) * 100;
    this.vfNdesB = this.safeDiv(this.vmaNdesB - this.vaNdesB, this.vmaNdesB) * 100;
    this.vfNdesAvg = (this.vfNdesA + this.vfNdesB) / 2;

    this.vaNmaxA = this.safeDiv(this.gmmAvg - this.gmbNmaxA, this.gmmAvg) * 100;
    this.vaNmaxB = this.safeDiv(this.gmmAvg - this.gmbNmaxB, this.gmmAvg) * 100;
    this.vaNmaxAvg = (this.vaNmaxA + this.vaNmaxB) / 2;
    this.vmaNmaxA = 100 - this.safeDiv(this.gmbNmaxA * this.ps, this.superpave.gsb);
    this.vmaNmaxB = 100 - this.safeDiv(this.gmbNmaxB * this.ps, this.superpave.gsb);
    this.vmaNmaxAvg = (this.vmaNmaxA + this.vmaNmaxB) / 2;
    this.vfNmaxA = this.safeDiv(this.vmaNmaxA - this.vaNmaxA, this.vmaNmaxA) * 100;
    this.vfNmaxB = this.safeDiv(this.vmaNmaxB - this.vaNmaxB, this.vmaNmaxB) * 100;
    this.vfNmaxAvg = (this.vfNmaxA + this.vfNmaxB) / 2;

    const gse = this.superpave.gse || 0;
    const gsb = this.superpave.gsb || 0;
    const gb = this.superpave.gb || 0;
    this.pba = 100 * this.safeDiv(gse - gsb, gse * gsb) * gb;
    this.pbe = this.acPercent - (this.pba / 100) * this.ps;
    this.passing200 = this.passing('L');
    this.dp = this.safeDiv(this.passing200, this.pbe);
  }

  generatePDF() {
    const doc = new jsPDF();
    doc.addFileToVFS('Amiri-Regular.ttf', AmiriFont);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');

    const head = new Image();
    const tail = new Image();
    head.src = 'assets/head.png';
    tail.src = 'assets/tail.jpeg';
    const s = this.superpave;
    const center = {halign: 'center' as const, valign: 'middle' as const};

    head.onload = () => {
      doc.addImage(head, 'PNG', 0, 0, 210, 33);

      const boxLeft = 11;
      const boxTop = 40.5;
      const boxWidth = 190;
      const innerMargin = {left: 11, right: 9, bottom: 32};

      doc.setFontSize(10);
      doc.setFont('Amiri', 'bold');
      const headerText = 'Bulk Specific Gravity of Compacted Specimen-AASHTO T166';
      const textY = 38.5;
      doc.text(headerText, 105, textY, {align: 'center'});
      const textWidth = doc.getTextWidth(headerText);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(105 - textWidth / 2, textY + 0.8, 105 + textWidth / 2, textY + 0.8);
      doc.setFont('Amiri', 'normal');

      const grid = {
        theme: 'grid' as const,
        margin: innerMargin,
        styles: {
          fontSize: 6.5,
          cellPadding: 0.65,
          font: 'Amiri',
          textColor: [0, 0, 0] as [number, number, number],
          lineColor: [0, 0, 0] as [number, number, number],
          lineWidth: 0.35,
          valign: 'middle' as const
        },
        headStyles: {
          fillColor: [255, 255, 255] as [number, number, number],
          textColor: [0, 0, 0] as [number, number, number],
          halign: 'center' as const,
          valign: 'middle' as const,
          fontStyle: 'bold' as const
        }
      };

      const num = (v: string) => ({content: v, styles: center});

      autoTable(doc, {
        startY: 40.5,
        body: [
          ['PROJECT', s.projectName || '', 'DATE SAMPLED :', this.formatDate(s.sampleDate)],
          ['Contractor', s.contractor || '', 'DATE TESTED :', this.formatDate(s.testingDate)],
          ['Job Order', s.jobOrder || '', 'Sample Type', s.sampleType || ''],
          ['Asphalt Supplier', s.asphaltApplier || '', 'Sample No', s.sampleNo || ''],
          ['Request Description', s.requestDescription || '', 'Sampled By', s.sampleBy || ''],
          ['Report No.', s.reportNo || '', 'Asphalt Layer', s.asphaltLayer || ''],
          ['Location', s.location || '', '', '']
        ],
        ...grid,
        styles: {...grid.styles, fontSize: 7},
        columnStyles: {
          0: {cellWidth: 38, fontStyle: 'bold'},
          1: {...center, cellWidth: 57},
          2: {cellWidth: 38, fontStyle: 'bold'},
          3: {...center, cellWidth: 57}
        }
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY,
        head: [[
          {content: '', styles: center},
          {content: 'Ndes', colSpan: 4, styles: center},
          {content: 'Nmax', colSpan: 4, styles: center}
        ], [
          '',
          {content: '1', styles: center},
          {content: '2', styles: center},
          {content: 'AVERAGE', styles: center},
          {content: "SPEC'S", styles: center},
          {content: '1', styles: center},
          {content: '2', styles: center},
          {content: 'AVERAGE', styles: center},
          {content: "SPEC'S", styles: center}
        ]],
        body: [
          ['A. Weight in Air, Dry (gms)', num(this.fmt(s.weightAirDryA, 0)), num(this.fmt(s.weightAirDryB, 0)), '', '', num(this.fmt(s.weightAirDryC, 0)), num(this.fmt(s.weightAirDryD, 0)), '', ''],
          ['B. Weight in Air, SSD (gms)', num(this.fmt(s.weightAirSsdA, 0)), num(this.fmt(s.weightAirSsdB, 0)), '', '', num(this.fmt(s.weightAirSsdC, 0)), num(this.fmt(s.weightAirSsdD, 0)), '', ''],
          ['C. Weight in Water, (gms)', num(this.fmt(s.weightWaterA, 0)), num(this.fmt(s.weightWaterB, 0)), '', '', num(this.fmt(s.weightWaterC, 0)), num(this.fmt(s.weightWaterD, 0)), '', ''],
          ['D. Volume, (cc)', num(this.fmt(this.volNdesA, 0)), num(this.fmt(this.volNdesB, 0)), '', '', num(this.fmt(this.volNmaxA, 0)), num(this.fmt(this.volNmaxB, 0)), '', ''],
          ['E. Specific Gravity (Gmb) (A/D)', num(this.fmt(this.gmbNdesA, 3)), num(this.fmt(this.gmbNdesB, 3)), num(this.fmt(this.gmbNdesAvg, 3)), '', num(this.fmt(this.gmbNmaxA, 3)), num(this.fmt(this.gmbNmaxB, 3)), num(this.fmt(this.gmbNmaxAvg, 3)), ''],
          ['Height @ Nini', num(this.fmt(s.heightNiniA, 1)), num(this.fmt(s.heightNiniB, 1)), num(this.fmt((s.heightNiniA + s.heightNiniB) / 2, 1)), '', num(this.fmt(s.heightNiniC, 1)), num(this.fmt(s.heightNiniD, 1)), num(this.fmt((s.heightNiniC + s.heightNiniD) / 2, 1)), ''],
          ['Height @ Ndes', num(this.fmt(s.heightNdesA, 1)), num(this.fmt(s.heightNdesB, 1)), num(this.fmt((s.heightNdesA + s.heightNdesB) / 2, 1)), '', num(this.fmt(s.heightNdesC, 1)), num(this.fmt(s.heightNdesD, 1)), num(this.fmt((s.heightNdesC + s.heightNdesD) / 2, 1)), ''],
          ['Height @ Nmax', num(this.zeroBlank(s.heightNmaxA, 1)), num(this.zeroBlank(s.heightNmaxB, 1)), num(this.zeroBlank((s.heightNmaxA + s.heightNmaxB) / 2, 1)), '', num(this.fmt(s.heightNmaxC, 1)), num(this.fmt(s.heightNmaxD, 1)), num(this.fmt((s.heightNmaxC + s.heightNmaxD) / 2, 1)), ''],
          ['% Gmm @ Nini', num(this.fmt(this.pctGmmNiniA, 1)), num(this.fmt(this.pctGmmNiniB, 1)), num(this.fmt(this.pctGmmNiniAvg, 1)), num(s.gmmNiniLimits || ''), num(this.fmt(this.pctGmmNiniNmaxA, 1)), num(this.fmt(this.pctGmmNiniNmaxB, 1)), num(this.fmt(this.pctGmmNiniNmaxAvg, 1)), ''],
          ['% Gmm @ Ndes', num(this.fmt(this.pctGmmNdesA, 1)), num(this.fmt(this.pctGmmNdesB, 1)), num(this.fmt(this.pctGmmNdesAvg, 1)), num(s.gmmNdesLimits || ''), num(this.fmt(this.pctGmmNdesNmaxA, 1)), num(this.fmt(this.pctGmmNdesNmaxB, 1)), num(this.fmt(this.pctGmmNdesNmaxAvg, 1)), ''],
          ['% Gmm @ Nmax', '', '', '', '', num(this.fmt(this.pctGmmNmaxA, 1)), num(this.fmt(this.pctGmmNmaxB, 1)), num(this.fmt(this.pctGmmNmaxAvg, 1)), num(s.gmmNmaxLimits || '')],
          ['Air Voids %', num(this.fmt(this.vaNdesA, 1)), num(this.fmt(this.vaNdesB, 1)), num(this.fmt(this.vaNdesAvg, 1)), num(s.airvoidsLimits || ''), num(this.fmt(this.vaNmaxA, 1)), num(this.fmt(this.vaNmaxB, 1)), num(this.fmt(this.vaNmaxAvg, 1)), ''],
          ['Voids in Mineral Aggregate (VMA) %', num(this.fmt(this.vmaNdesA, 1)), num(this.fmt(this.vmaNdesB, 1)), num(this.fmt(this.vmaNdesAvg, 1)), num(s.vmaLimits || ''), num(this.fmt(this.vmaNmaxA, 1)), num(this.fmt(this.vmaNmaxB, 1)), num(this.fmt(this.vmaNmaxAvg, 1)), ''],
          ['Voids Filled (VF) %', num(this.fmt(this.vfNdesA, 1)), num(this.fmt(this.vfNdesB, 1)), num(this.fmt(this.vfNdesAvg, 1)), num(s.vfLimits || ''), num(this.fmt(this.vfNmaxA, 1)), num(this.fmt(this.vfNmaxB, 1)), num(this.fmt(this.vfNmaxAvg, 1)), '']
        ],
        ...grid
      });

      let y = (doc as any).lastAutoTable.finalY + 2;
      doc.setFontSize(8);
      doc.setFont('Amiri', 'bold');
      doc.text('MAXIMUM THEORETICAL SPECIFIC GRAVITY (Gmm)', 14, y + 3);
      doc.setFont('Amiri', 'normal');
      doc.setFontSize(7);
      doc.text('ASTM D2041/D2041M-19', 196, y + 3, {align: 'right'});

      autoTable(doc, {
        startY: y + 5,
        head: [[
          {content: 'SPECIMEN I.D.', styles: center},
          {content: '1', styles: center},
          {content: '2', styles: center},
          {content: 'AVERAGE', styles: center},
          '',
          ''
        ]],
        body: [
          ['A. Net Weight of Loose Mix (gms)', num(this.fmt(s.netWeightOfLooseMixA, 0)), num(this.fmt(s.netWeightOfLooseMixB, 0)), '', 'Gb =', num(this.fmt(s.gb, 3))],
          ['B. Net Weight of Flask & Water (gms)', num(this.fmt(s.netWeightOfFlaskWaterA, 0)), num(this.fmt(s.netWeightOfFlaskWaterB, 0)), '', 'Gsb =', num(this.fmt(s.gsb, 3))],
          ['C. Net Weight of Flask, Loose Mix & Water (gms)', num(this.fmt(s.weightFlaskWaterSampleA, 0)), num(this.fmt(s.weightFlaskWaterSampleB, 0)), '', 'Ps =', num(this.fmt(this.ps, 2))],
          ['D. Maximum Theoretical Specific Gravity, Gmm (A/(A+B-C)', num(this.fmt(this.gmmA, 3)), num(this.fmt(this.gmmB, 3)), '', 'Gse =', num(this.fmt(s.gse, 3))],
          ['E. Average Gmm', {content: this.fmt(this.gmmAvg, 3), colSpan: 3, styles: {...center, fontStyle: 'bold'}}, 'Pba =', num(this.fmt(this.pba, 2))],
          ['', '', '', '', 'Pbe =', num(this.fmt(this.pbe, 2))],
          ['', '', '', '', 'DP =', num(`${this.fmt(this.dp, 2)}   ${s.dpLimits || ''}`)]
        ],
        ...grid
      });

      y = (doc as any).lastAutoTable.finalY + 2;
      doc.setFontSize(8);
      doc.setFont('Amiri', 'bold');
      doc.text('EXTRACTION AND GRADATION', 14, y + 3);
      doc.setFont('Amiri', 'normal');
      doc.setFontSize(7);
      doc.text('ASTM D2172/D2172M-17e1', 196, y + 3, {align: 'right'});

      const g = s.superpaveGradation || {} as any;
      autoTable(doc, {
        startY: y + 5,
        body: [
          ['ASPHALT CONTENT', {content: '1', styles: center}],
          ['A. Wt. of Sample Before Test,gms', num(this.fmt(this.bitumenVal('weightSampleBefore'), 1))],
          ['B. Wt. of Sample After Test, gms', num(this.fmt(this.bitumenVal('weightSampleAfter'), 1))],
          ['C. Wt. of Filter Before Test, gms', num(this.fmt(this.bitumenVal('weightFilterBefore'), 1))],
          ['D. Wt. of Filter After Test, gms', num(this.fmt(this.bitumenVal('weightFilterAfter'), 1))],
          ['E. Wt. of Sample in Filter, gms', num(this.fmt(this.filterSolids, 1))],
          ['F. Wt. of Total Agg. (B+E), gms', num(this.fmt(this.totalAgg, 1))],
          ['G. Wt. of Bitumen, (A-F), gms', num(this.fmt(this.bitumenWt, 1))],
          ['H. Percent AC (G/A x 100), %', num(this.fmt(this.acPercent, 1))],
          ['I. Average Asphalt Content %', {content: this.fmt(this.acPercent, 1), styles: {...center, fontStyle: 'bold'}}],
          ['Design', num(s.bitumencontentLimits || '')]
        ],
        ...grid,
        tableWidth: 78,
        margin: {left: 11, bottom: 32},
        columnStyles: {
          0: {cellWidth: 52},
          1: {...center, cellWidth: 26}
        }
      });
      const acY = (doc as any).lastAutoTable.finalY;

      const sieveRows = this.sieves.map(sv => [
        '',
        {content: sv.size, styles: center},
        num(this.panBlank(sv.key, Number(g['cumRetained' + sv.key] || 0), 1)),
        num(this.panBlank(sv.key, this.cumPassing(sv.key), 1)),
        num(this.panBlank(sv.key, this.passing(sv.key), 1)),
        {content: g['expand' + sv.key] || '', styles: center},
        {content: g['jmf' + sv.key] || '', styles: center},
        {content: g['controlPoint' + sv.key] || '', styles: center}
      ]);

      autoTable(doc, {
        startY: y + 5,
        head: [[
          {content: 'Oven Dry\ngms', styles: center},
          {content: 'Sieve\nSize', styles: center},
          {content: 'Weight\nRet. Gms.', styles: center},
          {content: 'Cum. Wt.\nPassing', styles: center},
          {content: 'Percent\nPassing', styles: center},
          {content: 'expand\nk*2', styles: center},
          {content: 'J.M.F.', styles: center},
          {content: 'Control\nPoint', styles: center}
        ]],
        body: sieveRows,
        ...grid,
        tableWidth: 111,
        margin: {left: 90, bottom: 32}
      });
      const gradY = (doc as any).lastAutoTable.finalY;

      const tailY = 265;
      const footerStart = Math.max(acY, gradY) + 1;
      const maxEnd = tailY - 1;
      const fill = maxEnd - footerStart - 4;
      let remarksH = 10;
      let signH = 14;
      if (fill > remarksH + signH) {
        remarksH = fill * 0.4;
        signH = fill * 0.6;
      }

      autoTable(doc, {
        startY: footerStart,
        pageBreak: 'avoid',
        body: [
          [{content: `Remarks : ${s.notes || ''}`, colSpan: 3, styles: {halign: 'left', valign: 'top', minCellHeight: remarksH}}],
          [
            {content: `Tested By\n${s.testBy || ''}`, styles: {...center, minCellHeight: signH}},
            {content: `Checked By\n${s.adopter || ''}`, styles: {...center, minCellHeight: signH}},
            {content: `Approved By\n${s.lastApproveBy || ''}`, styles: {...center, minCellHeight: signH}}
          ]
        ],
        ...grid,
        margin: {left: 11, right: 9, bottom: 32},
        styles: {...grid.styles, fontSize: 7}
      });

      const boxBottom = Math.min((doc as any).lastAutoTable.finalY, tailY);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(boxLeft, boxTop, boxWidth, boxBottom - boxTop);

      doc.addImage(tail, 'PNG', 0, tailY, 210, 33);

      doc.setFontSize(5);
      const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      };
      const currentDateTime = formatDateTime(new Date());
      doc.text(`Report Date: ${currentDateTime}`, 1, 290);

      doc.save(`SuperpaveReport_${s.reportNo || s.id}.pdf`);
    };
  }

  private bitumenVal(field: string): number {
    return Number((this.superpave.bitumen as any)?.[field] || 0);
  }
}
