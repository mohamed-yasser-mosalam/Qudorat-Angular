import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {AuthenticationService} from '../../../../../service/authentication/authentication.service';
import {EnCompressiveStrengthService} from '../../../../../service/en-compressive-strength/en-compressive-strength.service';
import {EnCompressiveStrength} from '../../../../../model/en-compressive-strength';

declare let AmiriFont: any;

interface CubeRow {
  sampleId: string;
  width: number;
  length: number;
  area: number;
  weight: number;
  unitMass: number;
  loadKn: number;
  loadKg: number;
  strengthKg: number;
  strengthMpa: number;
}

@Component({
  selector: 'app-en-compressive-strength-report',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './en-compressive-strength-report.component.html',
  styleUrl: './en-compressive-strength-report.component.css'
})
export class EnCompressiveStrengthReportComponent implements OnInit {

  entity: EnCompressiveStrength = {} as EnCompressiveStrength;
  role = '';
  id = 0;
  loaded = false;
  rows: CubeRow[] = [];
  avgKg = 0;
  avgMpa = 0;
  testDate = '';

  readonly remarkLines = [
    'The samples were tested in the presence of the Consultant’s Representative and the Contractor’s Representative.',
    'This report represents the laboratory-tested samples only.',
    'The concrete was cast by the client.'
  ];

  constructor(private authenticationService: AuthenticationService,
              private service: EnCompressiveStrengthService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.role = this.authenticationService.getAuthority();
    this.service.findById(this.id).subscribe(res => {
      this.entity = res;
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

  formatDate(value: string | undefined | null): string {
    if (!value) {
      return '';
    }
    const raw = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      return raw.substring(0, 10);
    }
    return raw;
  }

  reqMpa(): string {
    const kg = Number(this.entity.reqstrengthKg);
    if (!kg) {
      return '';
    }
    return this.fmt(kg * 0.098, 2);
  }

  notesLineCount(): number {
    const notes = (this.entity.notes || '').replace(/\r/g, '');
    if (!notes.trim()) {
      return 2;
    }
    return notes.split('\n').reduce((sum, line) => {
      return sum + Math.max(1, Math.ceil((line.length || 1) / 90));
    }, 0);
  }

  remarksMinHeight(): number {
    return Math.max(36, this.notesLineCount() * 18);
  }

  private cube(sampleId: string, width: number, length: number, weight: number, loadKn: number): CubeRow {
    const area = Number(width) * Number(width);
    const loadKg = Number(loadKn) * 101.971;
    const strengthKg = area ? loadKg / area : 0;
    return {
      sampleId: sampleId || '',
      width: Number(width) || 0,
      length: Number(length) || 0,
      area,
      weight: Number(weight) || 0,
      unitMass: area && length ? Number(weight) / (area * Number(length)) : 0,
      loadKn: Number(loadKn) || 0,
      loadKg,
      strengthKg,
      strengthMpa: strengthKg * 0.098
    };
  }

  private compute() {
    const e = this.entity;
    this.rows = [
      this.cube(e.sampleIdA, e.widthA, e.lengthA, e.weightSampleA, e.testLoadknA),
      this.cube(e.sampleIdB, e.widthB, e.lengthB, e.weightSampleB, e.testLoadknB),
      this.cube(e.sampleIdC, e.widthC, e.lengthC, e.weightSampleC, e.testLoadknC),
      this.cube(e.sampleIdD, e.widthD, e.lengthD, e.weightSampleD, e.testLoadknD),
      this.cube(e.sampleIdE, e.widthE, e.lengthE, e.weightSampleE, e.testLoadknE),
      this.cube(e.sampleIdF, e.widthF, e.lengthF, e.weightSampleF, e.testLoadknF)
    ];
    const n = this.rows.length;
    this.avgKg = this.rows.reduce((s, r) => s + r.strengthKg, 0) / n;
    this.avgMpa = this.rows.reduce((s, r) => s + r.strengthMpa, 0) / n;
    this.testDate = this.addDays(e.dataCasting, e.ageDays);
  }

  private addDays(value: string | undefined | null, days: number): string {
    const base = this.formatDate(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(base)) {
      return '';
    }
    const [year, month, day] = base.split('-').map(Number);
    const date = new Date(year, month - 1, day + Number(days || 0));
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  generatePDF() {
    const doc = new jsPDF();
    doc.addFileToVFS('Amiri-Regular.ttf', AmiriFont);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');

    const head = new Image();
    const tail = new Image();
    const fracture = new Image();
    head.src = 'assets/head.png';
    tail.src = 'assets/tail.jpeg';
    fracture.src = 'assets/en-fracture-types.jpg';
    const e = this.entity;
    const center = {halign: 'center' as const, valign: 'middle' as const};

    const start = () => {
      doc.addImage(head, 'PNG', 0, 0, 210, 33);

      const boxLeft = 11;
      const boxTop = 40.5;
      const boxWidth = 190;
      const tailY = 265;
      const innerMargin = {left: 11, right: 9, bottom: 32};

      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const headerText = 'Test Method: BS EN 12390-3:2019 — Compressive strength of test specimens.';
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
          fontSize: 8,
          cellPadding: 1.1,
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
          ['Project :', e.projectName || '', 'Structure :', e.structure || ''],
          ['Company :', e.company || '', 'Sample by :', e.sampleBy || ''],
          ['Location :', e.location || '', 'Slump (mm)', e.slump != null ? String(e.slump) : ''],
          ['Date Casting :', this.formatDate(e.dataCasting), 'Temperature (°C)', this.fmt(e.temperature, 1)],
          ['Date Received :', this.formatDate(e.dataReceived), 'Req. Strength for 28 Days (kg/cm²)', e.reqstrengthKg ? String(e.reqstrengthKg) : ''],
          ['Testing @', e.ageDays != null ? String(e.ageDays) : '', 'Req. Strength for 28 Days (Mpa)', this.reqMpa()],
          ['Days Date', this.testDate, '', ''],
          ['Lab. Report No. #', e.labreportNo || '', 'Sample No .', e.sampleNo || ''],
          ['Type of Sample :', e.typeofSample || '', '', '']
        ],
        ...grid,
        styles: {...grid.styles, fontSize: 8},
        columnStyles: {
          0: {cellWidth: 38, fontStyle: 'bold'},
          1: {...center, cellWidth: 57},
          2: {cellWidth: 48, fontStyle: 'bold'},
          3: {...center, cellWidth: 47}
        }
      });

      const body = this.rows.map((row, index) => {
        const cells: any[] = [
          num(row.sampleId),
          num(this.fmt(row.width, 0)),
          num(this.fmt(row.length, 0)),
          num(this.fmt(row.area, 0)),
          num(String(e.ageDays || '')),
          num(this.fmt(row.weight, 0)),
          num(this.fmt(row.unitMass, 3)),
          num(this.fmt(row.loadKn, 0)),
          num(this.fmt(row.loadKg, 2)),
          num(this.fmt(row.strengthKg, 2))
        ];
        if (index === 0) {
          cells.push({content: this.fmt(this.avgKg, 2), rowSpan: 6, styles: center});
        }
        cells.push(num(this.fmt(row.strengthMpa, 2)));
        if (index === 0) {
          cells.push({content: this.fmt(this.avgMpa, 2), rowSpan: 6, styles: center});
        }
        return cells;
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY,
        head: [[
          {content: 'Sample ID. #', styles: center},
          {content: 'Width (cm)', styles: center},
          {content: 'Length (cm)', styles: center},
          {content: 'Area (cm²)', styles: center},
          {content: 'Age in Days', styles: center},
          {content: 'Weight Sample (gm)', styles: center},
          {content: 'Unit Mass (gm/cc)', styles: center},
          {content: 'Test Load (KN)', styles: center},
          {content: 'Test Load (KG)', styles: center},
          {content: 'Compressive Strength (kg/cm²)', styles: center},
          {content: 'Avg. Comp. Strength (kg/cm²)', styles: center},
          {content: 'Compressive Strength (Mpa)', styles: center},
          {content: 'Avg. Comp. Strength (Mpa)', styles: center}
        ]],
        body,
        ...grid,
        styles: {...grid.styles, fontSize: 8, cellPadding: 1.4},
        headStyles: {
          ...grid.headStyles,
          fontSize: 7.2,
          cellPadding: 1.3
        }
      });

      const noteText = e.notes || '';
      const wrappedNotes = doc.splitTextToSize(noteText, 158);
      const remarksH = Math.max(14, wrappedNotes.length * 4.4 + 6);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY,
        body: [
          [
            {content: 'Remarks :', styles: {fontStyle: 'bold', halign: 'left', valign: 'top', minCellHeight: remarksH}},
            {content: noteText, styles: {halign: 'left', valign: 'top', minCellHeight: remarksH}}
          ],
          [
            {content: '1-', styles: {fontStyle: 'bold', halign: 'left', valign: 'top'}},
            {content: this.remarkLines[0], styles: {halign: 'left', valign: 'top'}}
          ],
          [
            {content: '2-', styles: {fontStyle: 'bold', halign: 'left', valign: 'top'}},
            {content: this.remarkLines[1], styles: {halign: 'left', valign: 'top'}}
          ],
          [
            {content: '3-', styles: {fontStyle: 'bold', halign: 'left', valign: 'top'}},
            {content: this.remarkLines[2], styles: {halign: 'left', valign: 'top'}}
          ]
        ],
        ...grid,
        styles: {...grid.styles, fontSize: 8, halign: 'left', valign: 'top'},
        columnStyles: {
          0: {cellWidth: 28, fontStyle: 'bold', halign: 'left'},
          1: {cellWidth: 162, halign: 'left'}
        }
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY,
        body: [[{content: 'Fracture Type', styles: {...center, fontStyle: 'bold'}}]],
        ...grid,
        styles: {...grid.styles, fontSize: 8, fontStyle: 'bold'}
      });

      const signH = 16;
      const afterTitle = (doc as any).lastAutoTable.finalY;
      const imgPad = 2;
      const imgW = 186;
      const naturalH = fracture.naturalHeight && fracture.naturalWidth
        ? imgW * (fracture.naturalHeight / fracture.naturalWidth)
        : 42;
      const maxImgH = Math.max(28, tailY - afterTitle - signH - 6);
      const imgH = Math.min(naturalH, maxImgH);

      autoTable(doc, {
        startY: afterTitle,
        body: [[{content: '', styles: {minCellHeight: imgH + imgPad * 2}}]],
        ...grid,
        didDrawCell: (data) => {
          if (data.section === 'body') {
            doc.addImage(
              fracture,
              'JPEG',
              data.cell.x + imgPad,
              data.cell.y + imgPad,
              data.cell.width - imgPad * 2,
              imgH
            );
          }
        }
      });

      const footerStart = (doc as any).lastAutoTable.finalY;
      autoTable(doc, {
        startY: footerStart,
        pageBreak: 'avoid',
        body: [[
          {content: `Test by:\n${e.testBy || ''}`, styles: {...center, minCellHeight: 16}},
          {content: `Checked by:\n${e.adopter || ''}`, styles: {...center, minCellHeight: 16}},
          {content: `Approved by:\n${e.lastApproveBy || ''}`, styles: {...center, minCellHeight: 16}}
        ]],
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
      doc.text(`Report Date: ${formatDateTime(new Date())}`, 1, 290);

      doc.save(`EnCompressiveStrengthReport_${e.labreportNo || e.id}.pdf`);
    };

    let started = false;
    const ready = () => {
      if (started || !head.complete || !fracture.complete) {
        return;
      }
      started = true;
      start();
    };
    head.onload = ready;
    fracture.onload = ready;
    ready();
  }
}
