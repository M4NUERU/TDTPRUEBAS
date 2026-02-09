const fs = require('fs');
const { jsPDF } = require('jspdf');

const content = fs.readFileSync('/home/josu/.gemini/antigravity/brain/62834937-4e81-49dc-91d0-5ac0825ca16d/proposal.md', 'utf8');

const doc = new jsPDF();
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.text('PROPUESTA TECNICA', 105, 15, { align: 'center' });
doc.text('ECOSISTEMA DIGITAL TODOTEJIDOS Y EMADERA', 105, 22, { align: 'center' });

doc.setDrawColor(0);
doc.line(15, 28, 195, 28);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);

const lines = content.split('\n');
let y = 35;

lines.forEach(line => {
    let cleanLine = line.replace(/\*\*/g, '').replace(/---/g, '').trim();
    if (!cleanLine) return;

    if (cleanLine.startsWith('# ')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        cleanLine = cleanLine.replace('# ', '');
        y += 4;
    } else if (cleanLine.startsWith('## ')) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        cleanLine = cleanLine.replace('## ', '');
        y += 2;
    } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
    }

    if (cleanLine.startsWith('|')) {
        cleanLine = cleanLine.replace(/\|/g, '  ').replace(/---+/g, '');
    }

    cleanLine = cleanLine.replace(/^- /, '  - ');

    const wrapped = doc.splitTextToSize(cleanLine, 175);
    wrapped.forEach(wl => {
        if (y > 285) {
            doc.addPage();
            y = 15;
        }
        doc.text(wl, 15, y);
        y += 4;
    });
});

const buffer = doc.output('arraybuffer');
fs.writeFileSync('/home/josu/Documentos/Propuesta_Tecnica_TODOTEJIDOS_EMADERA.pdf', Buffer.from(buffer));
console.log('PDF generado: /home/josu/Documentos/Propuesta_Tecnica_TODOTEJIDOS_EMADERA.pdf');
