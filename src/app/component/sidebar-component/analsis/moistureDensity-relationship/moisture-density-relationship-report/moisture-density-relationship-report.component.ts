import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AtterbergLimits} from "../../../../../model/atterberg-limits";
import {AtterbergLimitsService} from "../../../../../service/atterbergLimits/atterberg-limits.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MoistureDensityRelationship} from "../../../../../model/moisture-density-relationship";
import {
  MoistureDensityRelationshipService
} from "../../../../../service/MoistureDensityRelationship/moisture-density-relationship.service";
import {CommonModule, DecimalPipe} from "@angular/common";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";
import {AuthenticationService} from "../../../../../service/authentication/authentication.service";
declare let AmiriFont: any;

@Component({
  selector: 'app-moisture-density-relationship-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moisture-density-relationship-report.component.html',
  styleUrl: './moisture-density-relationship-report.component.css'
})
export class MoistureDensityRelationshipReportComponent implements OnInit {

  id: number = 0;
  moistureDensityRelationship: MoistureDensityRelationship = {} as MoistureDensityRelationship;
  role: string = '';

  @ViewChild('compactionChartCanvas', {static: true}) compactionChartCanvas!: ElementRef;
  compactionChart!: Chart;

  wetWtSoilA = 0; wetWtSoilB = 0; wetWtSoilC = 0; wetWtSoilD = 0; wetWtSoilE = 0;
  wetDensityA = 0; wetDensityB = 0; wetDensityC = 0; wetDensityD = 0; wetDensityE = 0;
  dryDensityA = 0; dryDensityB = 0; dryDensityC = 0; dryDensityD = 0; dryDensityE = 0;
  wtOfDrySoilA = 0; wtOfDrySoilB = 0; wtOfDrySoilC = 0; wtOfDrySoilD = 0; wtOfDrySoilE = 0;
  wtOfWaterA = 0; wtOfWaterB = 0; wtOfWaterC = 0; wtOfWaterD = 0; wtOfWaterE = 0;
  moistureContentA = 0; moistureContentB = 0; moistureContentC = 0; moistureContentD = 0; moistureContentE = 0;

  // 🟢 المتغيرات الجديدة للعرض في HTML
  mddDisplay: string = '';
  omcDisplay: string = '';

  constructor(
    private authenticationService: AuthenticationService,
    private service: MoistureDensityRelationshipService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.role = this.authenticationService.getAuthority();

    this.service.findById(this.id).subscribe(res => {
      this.moistureDensityRelationship = res;

      // الحسابات الأساسية
      this.wetWtSoilA = res.wetWtSoilMouldA - res.wtOfMould;
      this.wetWtSoilB = res.wetWtSoilMouldB - res.wtOfMould;
      this.wetWtSoilC = res.wetWtSoilMouldC - res.wtOfMould;
      this.wetWtSoilD = res.wetWtSoilMouldD - res.wtOfMould;
      this.wetWtSoilE = res.wetWtSoilMouldE - res.wtOfMould;

      this.wetDensityA = this.wetWtSoilA / res.volOfMould;
      this.wetDensityB = this.wetWtSoilB / res.volOfMould;
      this.wetDensityC = this.wetWtSoilC / res.volOfMould;
      this.wetDensityD = this.wetWtSoilD / res.volOfMould;
      this.wetDensityE = this.wetWtSoilE / res.volOfMould;

      this.wtOfDrySoilA = res.dryWtSoilContA - res.wtOfContainerA;
      this.wtOfDrySoilB = res.dryWtSoilContB - res.wtOfContainerB;
      this.wtOfDrySoilC = res.dryWtSoilContC - res.wtOfContainerC;
      this.wtOfDrySoilD = res.dryWtSoilContD - res.wtOfContainerD;
      this.wtOfDrySoilE = res.dryWtSoilContE - res.wtOfContainerE;

      this.wtOfWaterA = res.wetWtSoilContA - res.dryWtSoilContA;
      this.wtOfWaterB = res.wetWtSoilContB - res.dryWtSoilContB;
      this.wtOfWaterC = res.wetWtSoilContC - res.dryWtSoilContC;
      this.wtOfWaterD = res.wetWtSoilContD - res.dryWtSoilContD;
      this.wtOfWaterE = res.wetWtSoilContE - res.dryWtSoilContE;

      this.moistureContentA = this.wtOfWaterA / this.wtOfDrySoilA * 100;
      this.moistureContentB = this.wtOfWaterB / this.wtOfDrySoilB * 100;
      this.moistureContentC = this.wtOfWaterC / this.wtOfDrySoilC * 100;
      this.moistureContentD = this.wtOfWaterD / this.wtOfDrySoilD * 100;
      this.moistureContentE = this.wtOfWaterE / this.wtOfDrySoilE * 100;

      this.dryDensityA = this.wetDensityA / (this.moistureContentA / 100 + 1);
      this.dryDensityB = this.wetDensityB / (this.moistureContentB / 100 + 1);
      this.dryDensityC = this.wetDensityC / (this.moistureContentC / 100 + 1);
      this.dryDensityD = this.wetDensityD / (this.moistureContentD / 100 + 1);
      this.dryDensityE = this.wetDensityE / (this.moistureContentE / 100 + 1);

      this.createCompactionChart();

      // 🟢 حساب الـ MDD و OMC للعرض في الصفحة
      const hideColumnE =
        res.wetWtSoilMouldE == 0 &&
        res.wtOfContainerE == 0 &&
        res.dryWtSoilContE == 0 &&
        res.wetWtSoilContE == 0;

      const dryDensities = [
        this.dryDensityA, this.dryDensityB, this.dryDensityC, this.dryDensityD,
        ...(hideColumnE ? [] : [this.dryDensityE])
      ];
      const moistureContents = [
        this.moistureContentA, this.moistureContentB, this.moistureContentC, this.moistureContentD,
        ...(hideColumnE ? [] : [this.moistureContentE])
      ];

      const targetIndex = hideColumnE ? 2 : 3;

      const selectedDryDensity =
        typeof dryDensities[targetIndex] === 'number' && !isNaN(dryDensities[targetIndex])
          ? dryDensities[targetIndex]
          : Math.max(...dryDensities.filter(v => typeof v === 'number' && !isNaN(v)));

      const selectedMoistureContent =
        typeof moistureContents[targetIndex] === 'number' && !isNaN(moistureContents[targetIndex])
          ? moistureContents[targetIndex]
          : Math.max(...moistureContents.filter(v => typeof v === 'number' && !isNaN(v)));

      this.mddDisplay = Number(selectedDryDensity ?? 0).toFixed(3);
      this.omcDisplay = Number(selectedMoistureContent ?? 0).toFixed(2);
    });
  }

  createCompactionChart(hideColumnE: boolean = false): void {
    if (this.compactionChart) this.compactionChart.destroy();

    const moistureContent = [
      parseFloat(this.moistureContentA.toFixed(2)),
      parseFloat(this.moistureContentB.toFixed(2)),
      parseFloat(this.moistureContentC.toFixed(2)),
      parseFloat(this.moistureContentD.toFixed(2)),
      ...(hideColumnE ? [] : [parseFloat(this.moistureContentE.toFixed(2))])
    ];
    const dryDensity = [
      parseFloat(this.dryDensityA.toFixed(3)),
      parseFloat(this.dryDensityB.toFixed(3)),
      parseFloat(this.dryDensityC.toFixed(3)),
      parseFloat(this.dryDensityD.toFixed(3)),
      ...(hideColumnE ? [] : [parseFloat(this.dryDensityE.toFixed(3))])
    ];

    const dataPoints = moistureContent.map((mc, i) => ({ x: mc, y: dryDensity[i] }));

    this.compactionChart = new Chart(this.compactionChartCanvas.nativeElement, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Dry Density vs Moisture Content',
          data: dataPoints,
          backgroundColor: 'blue',
          borderColor: 'blue',
          pointRadius: 5,
          pointHoverRadius: 7,
          showLine: true,
          fill: false,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Moisture Content (%)' } },
          y: { title: { display: true, text: 'Dry Density (gm/cc)' } }
        }
      }
    });
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

    // Check if column E should be hidden
    const hideColumnE = this.moistureDensityRelationship.wetWtSoilMouldE == 0 &&
      this.moistureDensityRelationship.wtOfContainerE == 0 &&
      this.moistureDensityRelationship.dryWtSoilContE == 0 &&
      this.moistureDensityRelationship.wetWtSoilContE == 0;

    head.onload = () => {
      doc.addImage(head, 'PNG', 0, 0, 210, 33);
      doc.setFontSize(12);
      doc.text('Moisture Density Relationship', 70, 36);

      autoTable(doc, {
        startY: 38,
        body: [
          ['Project', this.moistureDensityRelationship.projectName || ' ',
            'Client', this.moistureDensityRelationship.clientName || ' '],
          ['Sample No', this.moistureDensityRelationship.sampleNo || ' ',
            'Sample By', this.moistureDensityRelationship.sampleBy || ' '],
          ['Sampling Date', this.moistureDensityRelationship.sampleDate || ' ',
            'Report No', this.moistureDensityRelationship.reportNo || ' '],
          ['Testing Date', this.moistureDensityRelationship.testingDate || ' ',
            'Standard', this.moistureDensityRelationship.classification || ' '],
          ['Consultant', this.moistureDensityRelationship.consultant || ' ',
            'Owner', this.moistureDensityRelationship.owner || ' '],
          ['Location', this.moistureDensityRelationship.location || ' ' ,
            'Wt. of Rammer', this.moistureDensityRelationship.wtOfRammer + ' kg' || ' '],
          ['Wt. of mould', this.moistureDensityRelationship.wtOfMould + ' gm' || ' ' ,
            'No. Blows/Layers', this.moistureDensityRelationship.noBlows || 'N/A'],
          ['Vol. of mould', this.moistureDensityRelationship.volOfMould  + ' c.c' || ' ' ,
            'No. of Layers', this.moistureDensityRelationship.noOfLayers || ' '],
        ],
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1,
          font: 'Amiri',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        columnStyles: {
          0: { cellWidth: 32.5 },
          1: { cellWidth: 60 },
          2: { cellWidth: 32.5 },
          3: { cellWidth: 60 }
        },
        margin: { left: 14, right: 14 }
      });

      let finalY = (doc as any).lastAutoTable.finalY;

      // Prepare headers and column styles based on whether column E is hidden
      const trialHeaders = hideColumnE ?
        ['1', '2', '3', '4'] :
        ['1', '2', '3', '4', '5'];

      let mouldDataColumnStyles: any;
      if (hideColumnE) {
        mouldDataColumnStyles = {
          0: { cellWidth: 60, halign: 'left' },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 }
        };
      } else {
        mouldDataColumnStyles = {
          0: { cellWidth: 60, halign: 'left' },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 }
        };
      }

      const mouldDataColspan = hideColumnE ? 5 : 6;

      // Prepare data rows for Mould Data table
      const mouldDataRows = [
        ['A. Wet Wt. Soil + Mould (gm)',
          this.moistureDensityRelationship.wetWtSoilMouldA,
          this.moistureDensityRelationship.wetWtSoilMouldB,
          this.moistureDensityRelationship.wetWtSoilMouldC,
          this.moistureDensityRelationship.wetWtSoilMouldD,
          ...(hideColumnE ? [] : [this.moistureDensityRelationship.wetWtSoilMouldE])],
        ['B. Wt. of Mould (gm)',
          ...Array(hideColumnE ? 4 : 5).fill(this.moistureDensityRelationship.wtOfMould)],
        ['C. Wet Wt. Soil (gm)',
          this.wetWtSoilA, this.wetWtSoilB, this.wetWtSoilC, this.wetWtSoilD,
          ...(hideColumnE ? [] : [this.wetWtSoilE])],
        ['D. Volume of Mould (cc)',
          ...Array(hideColumnE ? 4 : 5).fill(this.moistureDensityRelationship.volOfMould)],
        ['E. Wet Density (gm/cc)',
          this.wetDensityA.toFixed(1), this.wetDensityB.toFixed(1),
          this.wetDensityC.toFixed(1), this.wetDensityD.toFixed(1),
          ...(hideColumnE ? [] : [this.wetDensityE.toFixed(1)])],
        ['F. Dry Density (gm/cc)',
          this.dryDensityA.toFixed(3), this.dryDensityB.toFixed(3),
          this.dryDensityC.toFixed(3), this.dryDensityD.toFixed(3),
          ...(hideColumnE ? [] : [this.dryDensityE.toFixed(3)])]
      ];

      // جدول Mould Data
      autoTable(doc, {
        startY: finalY,
        head: [
          [{ content: 'Mould Data', colSpan: mouldDataColspan }],
          [
            { content: 'Trial Number #', styles: { halign: 'left', fontStyle: 'bold' } },
            ...trialHeaders.map(header => ({ content: header }))
          ]
        ],
        body: mouldDataRows,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1,
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.5,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },
        columnStyles: mouldDataColumnStyles,
        margin: { left: 14, right: 14 }
      });

      finalY = (doc as any).lastAutoTable.finalY;

      // Prepare data rows for Moisture Content table
      const moistureContentRows = [
        ['A. Wet Wt. Soil + Container (gm)',
          this.moistureDensityRelationship.wetWtSoilContA,
          this.moistureDensityRelationship.wetWtSoilContB,
          this.moistureDensityRelationship.wetWtSoilContC,
          this.moistureDensityRelationship.wetWtSoilContD,
          ...(hideColumnE ? [] : [this.moistureDensityRelationship.wetWtSoilContE])],
        ['B. Dry Wt. Soil + Container (gm)',
          this.moistureDensityRelationship.dryWtSoilContA,
          this.moistureDensityRelationship.dryWtSoilContB,
          this.moistureDensityRelationship.dryWtSoilContC,
          this.moistureDensityRelationship.dryWtSoilContD,
          ...(hideColumnE ? [] : [this.moistureDensityRelationship.dryWtSoilContE])],
        ['C. Wt. of Container (gm)',
          this.moistureDensityRelationship.wtOfContainerA,
          this.moistureDensityRelationship.wtOfContainerB,
          this.moistureDensityRelationship.wtOfContainerC,
          this.moistureDensityRelationship.wtOfContainerD,
          ...(hideColumnE ? [] : [this.moistureDensityRelationship.wtOfContainerE])],
        ['D. Wt. of Dry Soil (gm)',
          this.wtOfDrySoilA.toFixed(1), this.wtOfDrySoilB.toFixed(1),
          this.wtOfDrySoilC.toFixed(1), this.wtOfDrySoilD.toFixed(1),
          ...(hideColumnE ? [] : [this.wtOfDrySoilE.toFixed(1)])],
        ['E. Wt. of Water (gm)',
          this.wtOfWaterA.toFixed(1), this.wtOfWaterB.toFixed(1),
          this.wtOfWaterC.toFixed(1), this.wtOfWaterD.toFixed(1),
          ...(hideColumnE ? [] : [this.wtOfWaterE.toFixed(1)])],
        ['F. Moisture Content %',
          this.moistureContentA.toFixed(2), this.moistureContentB.toFixed(2),
          this.moistureContentC.toFixed(2), this.moistureContentD.toFixed(2),
          ...(hideColumnE ? [] : [this.moistureContentE.toFixed(2)])]
      ];

      // جدول Moisture Content
      autoTable(doc, {
        startY: finalY,
        head: [
          [{ content: 'Moisture Content Determination %', colSpan: mouldDataColspan }],
          [
            { content: 'Container #', styles: { halign: 'left', fontStyle: 'bold' } },
            ...trialHeaders
          ]
        ],
        body: moistureContentRows,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1,
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.5,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },
        columnStyles: mouldDataColumnStyles,
        margin: { left: 14, right: 14 }
      });

      finalY = (doc as any).lastAutoTable.finalY;

      setTimeout(() => {
        const canvasElement = this.compactionChartCanvas.nativeElement;
        const chartImage = canvasElement.toDataURL('image/png');

        const pageWidth = doc.internal.pageSize.getWidth();
        const borderW = 231;
        const borderH = 70;
        const scale = 0.8;
        const scaledBorderW = borderW * scale;
        const scaledBorderH = borderH * scale;
        const borderX = (pageWidth - scaledBorderW) / 1.8;
        const borderY = finalY;
        const chartW = scaledBorderW - 60;
        const chartH = scaledBorderH - 10;
        const chartX = borderX + (scaledBorderW - chartW) / 6;
        const chartY = borderY + (scaledBorderH - chartH) / 2;

        doc.addImage(chartImage, 'PNG', chartX, chartY, chartW, chartH);

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.rect(borderX, borderY, scaledBorderW, scaledBorderH);

        const dryDensities = [
          this.dryDensityA,
          this.dryDensityB,
          this.dryDensityC,
          this.dryDensityD,
          ...(hideColumnE ? [] : [this.dryDensityE])
        ];
        const moistureContents = [
          this.moistureContentA,
          this.moistureContentB,
          this.moistureContentC,
          this.moistureContentD,
          ...(hideColumnE ? [] : [this.moistureContentE])
        ];

        const targetIndex = hideColumnE ? 2 : 3;

        const selectedDryDensity = (typeof dryDensities[targetIndex] === 'number' && !isNaN(dryDensities[targetIndex]))
          ? dryDensities[targetIndex]
          : Math.max(...dryDensities.filter(v => typeof v === 'number' && !isNaN(v)));

        const selectedMoistureContent = (typeof moistureContents[targetIndex] === 'number' && !isNaN(moistureContents[targetIndex]))
          ? moistureContents[targetIndex]
          : Math.max(...moistureContents.filter(v => typeof v === 'number' && !isNaN(v)));

        const mddDisplay = Number(selectedDryDensity ?? 0).toFixed(3);
        const omcDisplay = Number(selectedMoistureContent ?? 0).toFixed(2);

        const startX = 145;
        let y = finalY + 20;
        const rowHeight = 10;
        const col1Width = 30;
        const col2Width = 30;

        doc.setFontSize(10);

        doc.rect(startX + 4.5, y, col1Width - 3, rowHeight);
        doc.rect(startX + col1Width + 1.5, y, col2Width - 10, rowHeight);
        doc.text("M.D.D (gm/cc)", startX + 5.5, y + 7);
        doc.text(mddDisplay , startX + col1Width + 3, y + 7);
        y += rowHeight + 2;

        doc.rect(startX + 4.5, y, col1Width - 3, rowHeight);
        doc.rect(startX + col1Width + 1.5, y, col2Width - 10, rowHeight);
        doc.text("O.M.C %", startX + 5.5, y + 7);
        doc.text(omcDisplay , startX + col1Width + 3, y + 7);


        finalY += 56;

        let footerY = finalY;
        doc.setFontSize(8);

        const pageWidth1 = doc.internal.pageSize.getWidth();
        const tableWidth1 = 184.7;
        const startX1 = (pageWidth1 - tableWidth1) / 1.8;
        const endX1 = startX1 + tableWidth1;
        const boxWidth = tableWidth1;

        let remarksHeight = 0;
        if (this.moistureDensityRelationship.notes) {
          const splitNotes = doc.splitTextToSize(
            `Remarks: ${this.moistureDensityRelationship.notes || ""}`,
            boxWidth - 8
          );

          doc.setFont("Amiri", "bold");
          doc.text(splitNotes, startX1 + 1, footerY + 3);

          remarksHeight = splitNotes.length * 5;
          footerY += remarksHeight + 5;
        }

        doc.line(startX1, 258, endX1, 258);

        doc.setFontSize(6);
        const sectionWidth = tableWidth1 / 3;

        doc.text(`Approved by: ${this.moistureDensityRelationship.lastApproveBy || " "}`, startX1 + 1, 261);
        doc.text(`Test by: ${this.moistureDensityRelationship.testBy || " "}`, startX1 + sectionWidth + 4, 261);
        doc.text(`Checked by: ${this.moistureDensityRelationship.approveBy || " "}`, startX1 + (sectionWidth * 2) + 4, 261);

        const blockTop = finalY;
        const blockBottom = 264;
        const blockHeight = blockBottom - blockTop;

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.rect(startX1, blockTop, tableWidth1, blockHeight);

        doc.addImage(tail, 'PNG', 0, 265, 210, 33);

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

        doc.save(`MoistureDensityRelationshipReport_${this.moistureDensityRelationship.testName}.pdf`);
      }, 1000);

    };
  }
}
