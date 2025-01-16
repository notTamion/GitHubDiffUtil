if (document.getElementById("diff-content-parent")) {
    let diffFiles = document.querySelectorAll('div.position-relative:has(> div > div > div > h3 > a > code)');

    for (let i = 0; i < diffFiles.length; i++) {
        let diffFile = diffFiles.item(i);
        if (diffFile.querySelector('div > div > div > h3 > a > code').lastChild.textContent.endsWith(".patch")) {
            let diffLines = diffFile.querySelectorAll('div > table > tbody > tr');

            for (let j = 0; j < diffLines.length; j++) {
                let diffLine = diffLines[j];
                let diffColumns = diffLine.querySelectorAll('td');
                let diffCode = diffLine.querySelector('td > code:has(div.diff-text-inner)');
                if (!diffCode) {
                    continue;
                }
                let diffText = diffCode.querySelector('div.diff-text-inner');
                let diffTextMarker = diffCode.querySelector('span.diff-text-marker');
                let outerMarker = '';
                if (diffTextMarker) {
                    outerMarker = diffTextMarker.textContent;
                }

                // Remove first character and remove highlighting for Lines that are part of the patch surrounding the actual diff
                if (diffText.firstChild && diffText.textContent.startsWith(" ")) {
                    for (let k = 0; k < diffColumns.length; k++) {
                        let diffColumn = diffColumns[k];
                        diffColumn.style.backgroundColor = '';
                    }
                    diffCode.classList.remove('addition');
                    diffCode.classList.remove('deletion');
                    let marker = diffCode.querySelector('.diff-text-marker')
                    if (marker) {
                        marker.remove();
                    }
                    diffText.textContent = diffText.textContent.slice(1)
                }

                let changeDiffMarker = diffCode.querySelector('div.diff-text-inner > span');
                let innerMarker = '';
                if (changeDiffMarker) {
                    innerMarker = changeDiffMarker.textContent.charAt(0);
                    console.log(innerMarker)
                    if (innerMarker !== '+' && innerMarker !== '-') {
                        continue;
                    }
                    diffText.textContent = changeDiffMarker.textContent.slice(1);
                    if (outerMarker === innerMarker) {
                        if (!diffCode.classList.contains('addition')) {
                            diffCode.classList.remove('deletion');
                            diffCode.classList.add('addition');
                            for (let k = 0; k < diffColumns.length; k++) {
                                let diffColumn = diffColumns[k];
                                diffColumn.style.backgroundColor = diffColumn.style.backgroundColor.replaceAll("deletion", "addition");
                            }
                        }
                    } else {
                        if (!diffCode.classList.contains('deletion')) {
                            diffCode.classList.remove('addition');
                            diffCode.classList.add('deletion');
                            for (let k = 0; k < diffColumns.length; k++) {
                                let diffColumn = diffColumns[k];
                                diffColumn.style.backgroundColor = diffColumn.style.backgroundColor.replaceAll("addition", "deletion");
                            }
                        }

                    }
                }

            }
        }
    }
}
