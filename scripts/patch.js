const diffBg = 'var(--diffBlob-kindLocation-bgColor, var(--diffBlob-kind-bgColor-location))'

document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        if (document.getElementById("diff-content-parent")) { // Commit diff page
            let diffFiles = document.querySelectorAll('div.position-relative:has(> div > div > div > h3 > a > code)');

            for (let i = 0; i < diffFiles.length; i++) {
                let diffFile = diffFiles.item(i);
                if (diffFile.querySelector('div > div > div > h3 > a > code').lastChild.textContent.endsWith(".patch")) {
                    let diffLines = diffFile.querySelectorAll('div > table > tbody > tr');

                    let nextMayPostponed = false;
                    let possiblePostpones = [];
                    for (let j = 0; j < diffLines.length; j++) {
                        let diffLine = diffLines[j]; // direct table child
                        if (diffLine.classList.contains('ghdu-processed')) {
                            continue;
                        }
                        diffLine.classList.add('ghdu-processed');
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
                                collapseUp(diffText);
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
                                collapseUp(diffText);
                                for (let k = 0; k < diffColumns.length; k++) {
                                    if (k === 2) {
                                        diffColumns[k].style.backgroundColor = diffBg.replaceAll('kind', 'addition').replace('location', 'line').replace('Location', 'Line');
                                    } else {
                                        diffColumns[k].style.backgroundColor = diffBg.replaceAll('kind', 'addition').replace('location', 'num').replace('Location', 'Num');
                                    }
                                }
                            } else if (innerMarker === '+') { // -, +
                                collapseUp(diffText);
                            } else if (innerMarker === ' ') { // -, _
                                for (let elem of possiblePostpones) {
                                    diffLine.parentElement.insertBefore(elem, diffLine);
                                }
                                possiblePostpones = []
                                diffLine.remove();
                            }
                        } else if (outerMarker.textContent === '+') { // +, ?
                            if (innerMarker === '-') { // +, -
                                if (nextMayPostponed) {
                                    possiblePostpones.push(diffLine);
                                }
                                outerMarker.textContent = '-';
                                diffCode.classList.remove('addition');
                                diffCode.classList.add('deletion');
                                collapseUp(diffText);
                                for (let k = 0; k < diffColumns.length; k++) {
                                    if (k === 2) {
                                        diffColumns[k].style.backgroundColor = diffBg.replaceAll('kind', 'deletion').replace('location', 'line').replace('Location', 'Line');
                                    } else {
                                        diffColumns[k].style.backgroundColor = diffBg.replaceAll('kind', 'deletion').replace('location', 'num').replace('Location', 'Num');
                                    }
                                }
                            } else if (innerMarker === '+') { // +, +
                                nextMayPostponed = false;
                                collapseUp(diffText);
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
        } else if (document.getElementById('files')) { // github pr diff
            let diffFiles = document.querySelectorAll('#files > div.js-diff-progressive-container > copilot-diff-entry');

            for (let i = 0; i < diffFiles.length; i++) {
                let diffFile = diffFiles.item(i);
                if (diffFile.getAttribute('data-file-path').endsWith(".patch")) {
                    let diffLines = diffFile.querySelectorAll('div > div.js-file-content > div.data > deferred-diff-lines > table > tbody > tr');
                    if (diffLines.length === 0) {
                        diffLines = diffFile.querySelectorAll('div > div.js-file-content > div.data > table > tbody > tr');
                    }

                    let nextMayPostponed = false;
                    let possiblePostpones = [];
                    for (let j = 0; j < diffLines.length; j++) {
                        let diffLine = diffLines[j]; // direct table child
                        if (diffLine.classList.contains('ghdu-processed')) {
                            continue;
                        }
                        diffLine.classList.add('ghdu-processed');
                        let diffColumns = diffLine.querySelectorAll('td'); // removed line, added line, diff content
                        let diffColumn = diffLine.querySelector('td.blob-code');
                        if (!diffColumn) {
                            continue;
                        }
                        let diffText = diffColumn.querySelector('span.blob-code-inner');
                        if (!diffText) {
                            continue;
                        }
                        let innerMarker = diffText.textContent.charAt(0)

                        if (diffText.getAttribute('data-code-marker') === ' ') { // _, ?
                            if (innerMarker === '-') { // _, -
                                possiblePostpones = [];
                                nextMayPostponed = true;
                                diffLine.remove()
                            } else if (innerMarker === '+') { // _, +
                                nextMayPostponed = false;
                                collapseUp(diffText);
                            } else if (innerMarker === ' ' || innerMarker === '') { // _, _
                                possiblePostpones = [];
                                nextMayPostponed = false;
                                if (diffText.firstElementChild) {
                                    diffText.firstElementChild.textContent = diffText.firstElementChild.textContent.slice(1);
                                }
                            }
                        } else if (diffText.getAttribute('data-code-marker') === '-') { // -, ?
                            if (innerMarker === '-') { // -, -
                                possiblePostpones = [];
                                diffText.setAttribute('data-code-marker', '+');
                                collapseUp(diffText);
                                for (let k = 0; k < diffColumns.length; k++) {
                                    diffColumns[k].setAttribute('class', diffColumns[k].getAttribute('class').replaceAll('deletion', 'addition'))
                                }
                            } else if (innerMarker === '+') { // -, +
                                collapseUp(diffText);
                            } else if (innerMarker === ' ' || innerMarker === '') { // -, _
                                for (let elem of possiblePostpones) {
                                    diffLine.parentElement.insertBefore(elem, diffLine);
                                }
                                possiblePostpones = []
                                diffLine.remove();
                            }
                        } else if (diffText.getAttribute('data-code-marker') === '+') { // +, ?
                            if (innerMarker === '-') { // +, -
                                if (nextMayPostponed) {
                                    possiblePostpones.push(diffLine);
                                }
                                diffText.setAttribute('data-code-marker', '-');
                                collapseUp(diffText);
                                for (let k = 0; k < diffColumns.length; k++) {
                                    diffColumns[k].setAttribute('class', diffColumns[k].getAttribute('class').replaceAll('addition', 'deletion'))
                                }
                            } else if (innerMarker === '+') { // +, +
                                nextMayPostponed = false;
                                collapseUp(diffText);
                            } else if (innerMarker === ' ' || innerMarker === '') { // +, _
                                possiblePostpones = [];
                                nextMayPostponed = false;
                                diffText.setAttribute('data-code-marker', ' ');
                                if (diffText.firstElementChild) {
                                    diffText.firstElementChild.textContent = diffText.firstElementChild.textContent.slice(1);
                                }
                                for (let k = 0; k < diffColumns.length; k++) {
                                    diffColumns[k].setAttribute('class', diffColumns[k].getAttribute('class').replaceAll('addition', 'context'))
                                }
                            }
                        }
                    }
                }
            }

        }
    }
});

function collapseUp(newParent) {
    if (newParent.directText()) {
        newParent.textContent = newParent.textContent.slice(1);
    } else {
        let oldParent = newParent.firstElementChild;
        newParent.innerHTML = oldParent.innerHTML
        if (newParent.firstElementChild) {
            newParent.firstElementChild.remove()
        }
    }
}

HTMLElement.prototype.directText=function (){
    let el=this.cloneNode(true);
    while (el.children[0]) el.children[0].remove();
    return el.textContent;
}