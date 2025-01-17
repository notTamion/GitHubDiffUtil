const diffBg = 'var(--diffBlob-kindLocation-bgColor, var(--diffBlob-kind-bgColor-location))'
if (document.getElementById("diff-content-parent")) {
    let diffFiles = document.querySelectorAll('div.position-relative:has(> div > div > div > h3 > a > code)');

    for (let i = 0; i < diffFiles.length; i++) {
        let diffFile = diffFiles.item(i);
        if (diffFile.querySelector('div > div > div > h3 > a > code').lastChild.textContent.endsWith(".patch")) {
            let diffLines = diffFile.querySelectorAll('div > table > tbody > tr');

            let nextMayPostponed = false;
            let possiblePostpones = [];
            for (let j = 0; j < diffLines.length; j++) {
                let diffLine = diffLines[j]; // direct table child
                let diffColumns = diffLine.querySelectorAll('td'); // removed line, added line, diff content
                let diffCode = diffLine.querySelector('td > code:has(div.diff-text-inner)'); // patch content code element (contains most of actual diff content
                if (!diffCode) {
                    continue;
                }
                let diffText = diffCode.querySelector('div.diff-text-inner');
                let outerMarker = diffCode.querySelector('span.diff-text-marker');
                let innerMarker = diffText.textContent.charAt(0)

                if (!outerMarker) { // _, ?
                    if (innerMarker === '-') { // _, -
                        possiblePostpones = [];
                        nextMayPostponed = true;
                        diffLine.remove()
                    } else if (innerMarker === '+') { // _, +
                        nextMayPostponed = false;
                        diffText.textContent = diffText.textContent.slice(1);
                    } else if (innerMarker === ' ') { // _, _
                        possiblePostpones = [];
                        nextMayPostponed = false;
                        diffText.textContent = diffText.textContent.slice(1);
                    }
                } else if (outerMarker.textContent === '-') { // -, ?
                    if (innerMarker === '-') { // -, -
                        possiblePostpones = [];
                        outerMarker.textContent = '+';
                        diffCode.classList.remove('deletion');
                        diffCode.classList.add('addition');
                        diffText.textContent = diffText.textContent.slice(1);
                        for (let k = 0; k < diffColumns.length; k++) {
                            if (k === 2) {
                                diffColumns[k].style.backgroundColor = diffBg.replaceAll('kind', 'addition').replace('location', 'line').replace('Location', 'Line');
                            } else {
                                diffColumns[k].style.backgroundColor = diffBg.replaceAll('kind', 'addition').replace('location', 'num').replace('Location', 'num');
                            }
                        }
                    } else if (innerMarker === '+') { // -, +
                        diffText.textContent = diffText.textContent.slice(1);
                    } else if (innerMarker === ' ') { // -, _
                        for (let elem of possiblePostpones) {
                            diffLine.parentElement.insertBefore(elem, diffLine);
                        }
                        possiblePostpones = []
                        diffLine.remove();
                    }
                } else if (outerMarker.textContent === '+') { // +, ?
                    if (innerMarker === '-') { // +, -
                        possiblePostpones.push(diffLine);
                        outerMarker.textContent = '-';
                        diffCode.classList.remove('addition');
                        diffCode.classList.add('deletion');
                        diffText.textContent = diffText.textContent.slice(1);
                        for (let k = 0; k < diffColumns.length; k++) {
                            if (k === 2) {
                                diffColumns[k].style.backgroundColor = diffBg.replaceAll('kind', 'deletion').replace('location', 'line').replace('Location', 'Line');
                            } else {
                                diffColumns[k].style.backgroundColor = diffBg.replaceAll('kind', 'deletion').replace('location', 'num').replace('Location', 'Num');
                            }
                        }
                    } else if (innerMarker === '+') { // +, +
                        nextMayPostponed = false;
                        diffText.textContent = diffText.textContent.slice(1);
                    } else if (innerMarker === ' ') { // +, _
                        possiblePostpones = [];
                        nextMayPostponed = false;
                        outerMarker.remove()
                        diffCode.classList.remove('addition');
                        diffText.textContent = diffText.textContent.slice(1);
                        for (let k = 0; k < diffColumns.length; k++) {
                            diffColumns[k].style.backgroundColor = '';
                        }
                    }
                }
            }
        }
    }
}
