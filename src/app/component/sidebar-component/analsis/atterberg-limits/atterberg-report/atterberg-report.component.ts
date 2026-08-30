import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DecimalPipe, NgIf} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {AtterbergLimits} from "../../../../../model/atterberg-limits";
import {AtterbergLimitsService} from "../../../../../service/atterbergLimits/atterberg-limits.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";
import {AuthenticationService} from "../../../../../service/authentication/authentication.service";
declare let AmiriFont: any;

@Component({
  selector: 'app-atterberg-report',
  standalone: true,
  imports: [
    DecimalPipe,
    NgIf
  ],
  templateUrl: './atterberg-report.component.html',
  styleUrl: './atterberg-report.component.css'
})
export class AtterbergReportComponent implements OnInit {

  atterbergLimits: AtterbergLimits = {} as AtterbergLimits;
  role: string = '';
  id: number = 0;

  @ViewChild('chartCanvas', {static: true}) chartCanvas!: ElementRef;
  chart!: Chart;

  @ViewChild('moistureChartCanvas', {static: true}) moistureChartCanvas!: ElementRef;
  moistureChart!: Chart;

  massOfSoil1: number = 0;
  massOfSoil2: number = 0;
  massOfSoil3: number = 0;
  massOfSoil4: number = 0;
  massOfSoil5: number = 0;
  massOfSoil6: number = 0;
  massOfSoil7: number = 0;
  massOfSoil8: number = 0;

  massOfWater1: number = 0;
  massOfWater2: number = 0;
  massOfWater3: number = 0;
  massOfWater4: number = 0;
  massOfWater5: number = 0;
  massOfWater6: number = 0;
  massOfWater7: number = 0;
  massOfWater8: number = 0;

  constructor(private authenticationService: AuthenticationService,private service: AtterbergLimitsService, private activatedRoute: ActivatedRoute, private router: Router) {
  }


  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.role = this.authenticationService.getAuthority();
    this.service.findById(this.id).subscribe(res => {
      this.atterbergLimits = res;
      this.massOfSoil1 = Number(this.atterbergLimits.massCanAndSoilDry1 - this.atterbergLimits.massOfEmptyCan1);
      this.massOfSoil2 = Number(this.atterbergLimits.massCanAndSoilDry2 - this.atterbergLimits.massOfEmptyCan2);
      this.massOfSoil3 = Number(this.atterbergLimits.massCanAndSoilDry3 - this.atterbergLimits.massOfEmptyCan3);
      this.massOfSoil4 = Number(this.atterbergLimits.massCanAndSoilDry4 - this.atterbergLimits.massOfEmptyCan4);
      this.massOfSoil5 = Number(this.atterbergLimits.massCanAndSoilDry5 - this.atterbergLimits.massOfEmptyCan5);
      this.massOfSoil6 = Number(this.atterbergLimits.massCanAndSoilDry6 - this.atterbergLimits.massOfEmptyCan6);
      this.massOfSoil7 = Number(this.atterbergLimits.massCanAndSoilDry7 - this.atterbergLimits.massOfEmptyCan7);
      this.massOfSoil8 = Number(this.atterbergLimits.massCanAndSoilDry8 - this.atterbergLimits.massOfEmptyCan8);
      this.massOfWater1 = Number(this.atterbergLimits.massCanAndSoilWet1 - this.atterbergLimits.massCanAndSoilDry1);
      this.massOfWater2 = Number(this.atterbergLimits.massCanAndSoilWet2 - this.atterbergLimits.massCanAndSoilDry2);
      this.massOfWater3 = Number(this.atterbergLimits.massCanAndSoilWet3 - this.atterbergLimits.massCanAndSoilDry3);
      this.massOfWater4 = Number(this.atterbergLimits.massCanAndSoilWet4 - this.atterbergLimits.massCanAndSoilDry4);
      this.massOfWater5 = Number(this.atterbergLimits.massCanAndSoilWet5 - this.atterbergLimits.massCanAndSoilDry5);
      this.massOfWater6 = Number(this.atterbergLimits.massCanAndSoilWet6 - this.atterbergLimits.massCanAndSoilDry6);
      this.massOfWater7 = Number(this.atterbergLimits.massCanAndSoilWet7 - this.atterbergLimits.massCanAndSoilDry7);
      this.massOfWater8 = Number(this.atterbergLimits.massCanAndSoilWet8 - this.atterbergLimits.massCanAndSoilDry8);
      this.createPlasticityChart();
      this.createMoistureChart();
    })
  }

createPlasticityChart(): void {
  if (this.chart) {
    this.chart.destroy();
  }

  const liquidLimit = this.atterbergLimits.liquidLimit;
  const plasticLimit = this.atterbergLimits.plasticLimit;
  const plasticityIndex = liquidLimit - plasticLimit;

  const xValues = Array.from({ length: 101 }, (_, i) => i);
  const aLine = xValues.map(x => 0.73 * (x - 20));
  const uLine = xValues.map(x => 0.9 * (x - 8));
  const upperLimit = xValues.map(x => 0.9 * x);

  this.chart = new Chart(this.chartCanvas.nativeElement, {
    type: 'scatter',
    data: {
      datasets: [
        // Sample Point
        {
          label: 'Sample Point',
          data: [{ x: liquidLimit, y: plasticityIndex }],
          backgroundColor: 'orange',
          pointRadius: 8,
          pointHoverRadius: 10,
          showLine: false
        },

        // A-Line
        {
          label: 'A-Line (PI = 0.73(LL - 20))',
          data: xValues.map((x, i) => ({ x, y: aLine[i] })),
          borderColor: 'blue',
          borderWidth: 2,
          fill: false,
          showLine: true,
          pointRadius: 0
        },

        // U-Line
        {
          label: 'U-Line (PI = 0.9(LL - 8))',
          data: xValues.map((x, i) => ({ x, y: uLine[i] })),
          borderColor: 'purple',
          borderWidth: 2,
          borderDash: [6, 6],
          fill: false,
          showLine: true,
          pointRadius: 0
        },

        {
          label: 'Upper Limit Line (PI = 0.9 × LL)',
          data: xValues.map((x, i) => ({ x, y: upperLimit[i] })),
          borderColor: 'blue',
          borderWidth: 2,
          fill: false,
          showLine: true,
          pointRadius: 0
        },

        // Vertical line at LL = 50
        {
          label: 'Boundary (LL = 50)',
          data: [
            { x: 50, y: 0 },
            { x: 50, y: 80 }
          ],
          borderColor: 'gray',
          borderWidth: 2,
          borderDash: [4, 4],
          fill: false,
          showLine: true,
          pointRadius: 0
        },

        // Optional PI = 4 line
        {
          label: 'PI = 4',
          data: [
            { x: 0, y: 4 },
            { x: 100, y: 4 }
          ],
          borderColor: 'green',
          borderDash: [4, 4],
          borderWidth: 1.5,
          showLine: true,
          pointRadius: 0
        },

        // Optional PI = 7 line
        {
          label: 'PI = 7',
          data: [
            { x: 0, y: 7 },
            { x: 100, y: 7 }
          ],
          borderColor: 'darkgreen',
          borderDash: [4, 4],
          borderWidth: 1.5,
          showLine: true,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Plasticity Chart (Casagrande Chart)',
          font: { size: 16 }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Liquid Limit (LL or wL) (%)',
            font: { size: 16, weight: 'bold' }
          },
          min: 0,
          max: 100,
          grid: { color: '#eee' }
        },
        y: {
          title: {
            display: true,
            text: 'Plasticity Index (PI) (%)'
          },
          min: 0,
          max: 80,
          grid: { color: '#eee' }
        }
      }
    },
    plugins: [
      {
        id: 'regionLabels',
        afterDraw: chart => {
          const ctx = chart.ctx;
          ctx.save();
          ctx.font = '14px Arial';
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';

          // CL-ML
          ctx.fillText('CL-ML', chart.scales['x'].getPixelForValue(20), chart.scales['y'].getPixelForValue(5));

          // CL or OL
          ctx.fillText('CL or OL', chart.scales['x'].getPixelForValue(33), chart.scales['y'].getPixelForValue(15));

          // CH or OH
          ctx.fillText('CH or OH', chart.scales['x'].getPixelForValue(60), chart.scales['y'].getPixelForValue(35));

          // MH or OH
          ctx.fillText('MH or OH', chart.scales['x'].getPixelForValue(70), chart.scales['y'].getPixelForValue(17));

          // "U" Line label
          ctx.fillText('"U" Line', chart.scales['x'].getPixelForValue(68), chart.scales['y'].getPixelForValue(53));

          // "A" Line label
          ctx.fillText('"A" Line', chart.scales['x'].getPixelForValue(82), chart.scales['y'].getPixelForValue(45));

          ctx.restore();
        }
      }
    ]
  });
}


createMoistureChart(): void {
  if (this.moistureChart) {
    this.moistureChart.destroy();
  }

  const blowsRaw = [
    this.atterbergLimits.numberOfBlows5,
    this.atterbergLimits.numberOfBlows6,
    this.atterbergLimits.numberOfBlows7,
    this.atterbergLimits.numberOfBlows8
  ];

  const waterRaw = [
    Number((this.massOfWater5 / this.massOfSoil5) * 100),
    Number((this.massOfWater6 / this.massOfSoil6) * 100),
    Number((this.massOfWater7 / this.massOfSoil7) * 100),
    Number((this.massOfWater8 / this.massOfSoil8) * 100)
  ];

  const dataPoints = blowsRaw.map((x, i) => ({ x: x, y: waterRaw[i] }));
  const validPairs = dataPoints.filter(p => p.x && p.x > 0 && !isNaN(p.x) && p.y && !isNaN(p.y));

  if (validPairs.length < 2) {
    validPairs.push({ x: 10, y: 20 });
    validPairs.push({ x: 100, y: 10 });
  }

  const lnX = validPairs.map(p => Math.log(p.x));
  const y = validPairs.map(p => p.y);
  const n = validPairs.length;

  const sumLnX = lnX.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumLnX2 = lnX.reduce((a, b) => a + b * b, 0);
  const sumLnXy = lnX.reduce((sum, lnxi, i) => sum + lnxi * y[i], 0);

  const a = (n * sumLnXy - sumLnX * sumY) / (n * sumLnX2 - sumLnX * sumLnX);
  const b = (sumY - a * sumLnX) / n;

  const yMean = sumY / n;
  const ssTot = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const ssRes = y.reduce((sum, yi, i) => sum + (yi - (a * lnX[i] + b)) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;

  const minX = Math.min(...validPairs.map(p => p.x));
  const maxX = Math.max(...validPairs.map(p => p.x));
  const range = maxX - minX;
  const extendedMinX = minX - range * 0.1;
  const extendedMaxX = maxX + range * 0.1;

  const regressionLine = [];
  for (let x = extendedMinX; x <= extendedMaxX; x += 0.5) {
    regressionLine.push({ x, y: a * Math.log(x) + b });
  }

  this.moistureChart = new Chart(this.moistureChartCanvas.nativeElement, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Water Content Data',
          data: dataPoints,
          backgroundColor: 'blue',
          pointRadius: 6,
          parsing: false
        },
        {
          type: 'line',
          label: 'Log Regression Fit',
          data: regressionLine,
          borderColor: 'red',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0,
          parsing: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'nearest' },
        title: {
          display: true,
          text: `y = ${a.toFixed(3)}ln(x) + ${b.toFixed(3)} | R² = ${r2.toFixed(4)}`
        }
      },
      scales: {
        x: {
          type: 'logarithmic',
          title: {
            display: true,
            text: 'Number of Blows (N)',
            font: { size: 16, weight: 'bold' }
          },
          min: 10,
          max: 100,
          ticks: {
            font: { size: 14 },
            callback: function (value) {
              const realValue = Number(value);
              const shownTicks = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
              if (shownTicks.includes(realValue)) {
                return realValue.toString();
              }
              return null;
            }

          }
        },
        y: {
          title: {
            display: true,
            text: 'Water Content (%)',
            font: { size: 16, weight: 'bold' }
          },
          ticks: { font: { size: 14 } },
          min: Number((this.massOfWater5 / this.massOfSoil5) * 100) - 5,
          max: Number((this.massOfWater8 / this.massOfSoil8) * 100) + 10
        }
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
    const qr = new Image();

    head.src = 'assets/head.png';
    tail.src = 'assets/tail.jpeg';
    qr.src = 'assets/barcode.jpg';

    head.onload = () => {
      doc.addImage(head, 'PNG', 0, 0, 210, 33);
      doc.setFontSize(12);
      doc.text('Atterberg Limits Data Sheet', 70, 34)
      doc.setFontSize(10);
      const infoRows = [
        ['Project', this.atterbergLimits.projectName || ' ', 'Test Name', this.atterbergLimits.nameOfTest || ' '],
        ['Client', this.atterbergLimits.clientName || ' ', 'Testing Date', this.atterbergLimits.testingDate || ' '],
        ['Sample No', this.atterbergLimits.sampleNo || ' ', 'Standard', this.atterbergLimits.classification || ' '],
        ['Sample By', this.atterbergLimits.sampleBy || ' ', 'Consultant', this.atterbergLimits.consultant || ' '],
        ['Sampling Date', this.atterbergLimits.sampleDate || ' ', 'Owner', this.atterbergLimits.owner || ' '],
        ['Report No', { content: this.atterbergLimits.reportNo || ' ', colSpan: 3 }]
      ];

      autoTable(doc, {
        body: infoRows,
        startY: 36,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 0.5,
          font: 'Amiri',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        columnStyles: {
          0: { cellWidth: 34.5 },
          1: { cellWidth: 60.5 },
          2: { cellWidth: 34.5 },
          3: { cellWidth: 60.5 }
        },
        margin: { left: 10, right: 13 },
        tableWidth: 'auto'
      });


      autoTable(doc, {
        startY: 59 ,
        head: [
          [
            {content: 'TEST', colSpan: 3, styles: {lineWidth: 0.5}},
            {content: 'PLASTIC LIMIT', colSpan: 4, styles: {lineWidth: 0.5}},
            {content: 'LIQUID LIMIT', colSpan: 4, styles: {lineWidth: 0.5}}
          ],
          [
            {content: 'Variable', styles: {lineWidth: 0.5}},
            {content: 'NO', colSpan: 2, styles: {lineWidth: 0.5}},
            {content: '1', styles: {lineWidth: 0.5}},
            {content: '2', styles: {lineWidth: 0.5}},
            {content: '3', styles: {lineWidth: 0.5}},
            {content: '4', styles: {lineWidth: 0.5}},
            {content: '1', styles: {lineWidth: 0.5}},
            {content: '2', styles: {lineWidth: 0.5}},
            {content: '3', styles: {lineWidth: 0.5}},
            {content: '4', styles: {lineWidth: 0.5}}
          ],
          [
            {content: '', styles: {lineWidth: 0.5}},
            {content: 'Var.', styles: {lineWidth: 0.5}},
            {content: 'Units', styles: {lineWidth: 0.5}},
            ...Array(8).fill({content: '', styles: {lineWidth: 0.5}})
          ]
        ],
        body: [
          ['Number of Blows', 'N', 'blows', '', '', '', '', this.atterbergLimits.numberOfBlows5, this.atterbergLimits.numberOfBlows6, this.atterbergLimits.numberOfBlows7, this.atterbergLimits.numberOfBlows8],
          ['Can Number', '---', '---', this.atterbergLimits.canNumber1, this.atterbergLimits.canNumber2, this.atterbergLimits.canNumber3, this.atterbergLimits.canNumber4,
            this.atterbergLimits.canNumber5, this.atterbergLimits.canNumber6, this.atterbergLimits.canNumber7, this.atterbergLimits.canNumber8],
          ['Mass of Empty Can', 'MC', '(g)', this.atterbergLimits.massOfEmptyCan1, this.atterbergLimits.massOfEmptyCan2, this.atterbergLimits.massOfEmptyCan3, this.atterbergLimits.massOfEmptyCan4,
            this.atterbergLimits.massOfEmptyCan5, this.atterbergLimits.massOfEmptyCan6, this.atterbergLimits.massOfEmptyCan7, this.atterbergLimits.massOfEmptyCan8],
          ['Mass Can & Soil (Wet)', 'MCMS', '(g)', this.atterbergLimits.massCanAndSoilWet1, this.atterbergLimits.massCanAndSoilWet2, this.atterbergLimits.massCanAndSoilWet3, this.atterbergLimits.massCanAndSoilWet4,
            this.atterbergLimits.massCanAndSoilWet5, this.atterbergLimits.massCanAndSoilWet6, this.atterbergLimits.massCanAndSoilWet7, this.atterbergLimits.massCanAndSoilWet8],
          ['Mass Can & Soil (Dry)', 'MCDS', '(g)', this.atterbergLimits.massCanAndSoilDry1, this.atterbergLimits.massCanAndSoilDry2, this.atterbergLimits.massCanAndSoilDry3, this.atterbergLimits.massCanAndSoilDry4,
            this.atterbergLimits.massCanAndSoilDry5, this.atterbergLimits.massCanAndSoilDry6, this.atterbergLimits.massCanAndSoilDry7, this.atterbergLimits.massCanAndSoilDry8],
          ['Mass of Soil', 'MS', '(g)',
            Number(this.massOfSoil1).toFixed(2),
            Number(this.massOfSoil2).toFixed(2),
            Number(this.massOfSoil3).toFixed(2),
            Number(this.massOfSoil4).toFixed(2),
            Number(this.massOfSoil5).toFixed(2),
            Number(this.massOfSoil6).toFixed(2),
            Number(this.massOfSoil7).toFixed(2),
            Number(this.massOfSoil8).toFixed(2)],
          ['Mass of Water', 'MW', '(g)',
            Number(this.massOfWater1).toFixed(2),
            Number(this.massOfWater2).toFixed(2),
            Number(this.massOfWater3).toFixed(2),
            Number(this.massOfWater4).toFixed(2),
            Number(this.massOfWater5).toFixed(2),
            Number(this.massOfWater6).toFixed(2),
            Number(this.massOfWater7).toFixed(2),
            Number(this.massOfWater8).toFixed(2)],
          ['Water Content', 'w', '(%)',
            Number(this.massOfWater1 / this.massOfSoil1 * 100).toFixed(2),
            Number(this.massOfWater2 / this.massOfSoil2 * 100).toFixed(2),
            Number(this.massOfWater3 / this.massOfSoil3 * 100).toFixed(2),
            Number(this.massOfWater4 / this.massOfSoil4 * 100).toFixed(2),
            Number(this.massOfWater5 / this.massOfSoil5 * 100).toFixed(2),
            Number(this.massOfWater6 / this.massOfSoil6 * 100).toFixed(2),
            Number(this.massOfWater7 / this.massOfSoil7 * 100).toFixed(2),
            Number(this.massOfWater8 / this.massOfSoil8 * 100).toFixed(2),
          ]
        ],
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 0.5,
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
        columnStyles: {
          0: {cellWidth: 30, halign: 'left'},
          1: {cellWidth: 16},
          2: {cellWidth: 16},
          3: {cellWidth: 16},
          4: {cellWidth: 16},
          5: {cellWidth: 16},
          6: {cellWidth: 16},
          7: {cellWidth: 16},
          8: {cellWidth: 16},
          9: {cellWidth: 16},
          10: {cellWidth: 16}
        },
        margin: {left: 10}
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY,
        body: [
          ['Liquid Limit (LL or wL) (%):', this.atterbergLimits.liquidLimit],
          ['Plastic Limit (PL or wP) (%):', this.atterbergLimits.plasticLimit],
          ['Plasticity Index (PI) (%):', Number((this.atterbergLimits.liquidLimit - this.atterbergLimits.plasticLimit).toFixed(2))],
          ['USCS Classification:', this.atterbergLimits.uscs]
        ],
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 0.5,
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.5,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0]
        },
        columnStyles: {
          0: {cellWidth: 100, halign: 'left'},
          1: {cellWidth: 90},
        },
        margin: {left: 10}
      });

      let finalY = (doc as any).lastAutoTable.finalY ;

      setTimeout(() => {
        const chartCanvases = document.querySelectorAll('canvas') as NodeListOf<HTMLCanvasElement>;

        if (chartCanvases.length > 0) {
          const chartImage1 = chartCanvases[0].toDataURL('image/png');

          const pageWidth = doc.internal.pageSize.getWidth();
          const borderW = 237.5;
          const borderH = 70;
          const scale = 0.8;
          const scaledBorderW = borderW * scale;
          const scaledBorderH = borderH * scale;
          const borderX = (pageWidth - scaledBorderW) / 2;
          const borderY = finalY ;
          const chartW = scaledBorderW - 2;
          const chartH = scaledBorderH - 10;
          const chartX = borderX + (scaledBorderW - chartW) / 2;
          const chartY = borderY + (scaledBorderH - chartH) / 2;

          doc.addImage(chartImage1, 'PNG',  chartX, chartY, chartW, chartH);

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.6);
          doc.rect(borderX, borderY, scaledBorderW, scaledBorderH);

          doc.setFontSize(10);
          finalY += 56;

          if (chartCanvases.length > 1) {
            const chartImage2 = chartCanvases[1].toDataURL('image/png');

            const pageWidth = doc.internal.pageSize.getWidth();
            const borderW = 237.5;
            const borderH = 70;
            const scale = 0.8;
            const scaledBorderW = borderW * scale;
            const scaledBorderH = borderH * scale;
            const borderX = (pageWidth - scaledBorderW) / 2;
            const borderY = finalY ;
            const chartW = scaledBorderW - 2;
            const chartH = scaledBorderH - 10;
            const chartX = borderX + (scaledBorderW - chartW) / 2;
            const chartY = borderY + (scaledBorderH - chartH) / 2;


            doc.addImage(chartImage2, 'PNG',  chartX, chartY, chartW, chartH);

            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.6);
            doc.rect(borderX, borderY, scaledBorderW, scaledBorderH);
            finalY += 40;
          }
        }

        finalY += 16;
        let footerY = finalY ;
        doc.setFontSize(8);

        const pageWidth = doc.internal.pageSize.getWidth();
        const tableWidth = 190;
        const startX = (pageWidth - tableWidth) / 2;
        const endX = startX + tableWidth;
        const boxWidth = tableWidth;

        let remarksHeight = 0;
        if (this.atterbergLimits.notes) {
          const splitNotes = doc.splitTextToSize(
            `Remarks: ${this.atterbergLimits.notes || ""}`,
            boxWidth - 9
          );

          doc.setFont("Amiri", "bold");
          doc.text(splitNotes, startX + 1, footerY + 3);

          remarksHeight = splitNotes.length * 5;
          footerY += remarksHeight + 5;
        }

        doc.line(startX, 260, endX, 260);

        doc.setFontSize(6);
        const sectionWidth = tableWidth / 3;

        doc.text(`Approved by: ${this.atterbergLimits.lastApproveBy || " "}`, startX + 1, 264);

        doc.text(`Test by: ${this.atterbergLimits.testBy || " "}`, startX + sectionWidth + 4, 264);

        doc.text(`Checked by: ${this.atterbergLimits.approveBy || " "}`, startX + (sectionWidth * 2) + 4, 264);

        const blockTop = finalY;
        const blockBottom = 266;
        const blockHeight = blockBottom - blockTop;

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.rect(startX, blockTop, tableWidth, blockHeight);



        doc.addImage(tail, 'PNG', 0, 267, 210, 33);

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
        doc.text(`Report Date: ${currentDateTime}`, 1, 293);

        doc.save(`AtterbergLimitsReport_${this.atterbergLimits.testName}.pdf`);
      }, 1000);
    };
  }
}
