<script lang="ts">
    let { selecteditems, 
          barcodeIsOpen = $bindable()
    } = $props()
    let dialog = $state<HTMLDialogElement>()

    function closeModal() {
        barcodeIsOpen = false
    }

    function printBarCode() {
        const checkedCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
        const checkedValues = checkedCheckboxes.map(checkbox => checkbox.value);
        if (checkedValues.length > 0) generatePDF(checkedValues);
    }

    function generatePDF(words) {

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        let x = 10, y = 10;
        const barcodeHeight = 20, barcodeWidth = 80, borderPadding = 1;
        words.forEach((word, index) => {
            let text = word.split(" ")[1]
            word = word.split(" ")[0]
            console.log(word, text)
            const canvas = document.createElement('canvas');
            const trimmedWord = word.trim();
            JsBarcode(canvas, trimmedWord, {
                format: "CODE39",
                height: barcodeHeight,
                width: 1,
                text
            });
            const imgData = canvas.toDataURL('image/png');
            doc.rect(
                x - borderPadding,
                y - borderPadding,
                barcodeWidth + (borderPadding * 2),
                barcodeHeight + (borderPadding * 2)
            );
            doc.addImage(imgData, 'PNG', x, y, barcodeWidth, barcodeHeight);
            x += barcodeWidth + 5;
            if (x > 150) {
                x = 10;
                y += barcodeHeight + 5;
            }
            if (y > 250) {
                doc.addPage();
                x = 10;
                y = 10;
            }
        });
        doc.save('barcodes.pdf');
    }

	$effect(() => {
		if (!dialog) return;

		console.log(barcodeIsOpen)
		if (barcodeIsOpen) {
			dialog.showModal();
		} else if (barcodeIsOpen == false){
			dialog.close()

		}
	})

</script>

<dialog
	bind:this={dialog}
	onclose={() => (barcodeIsOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
    <div class="internal">
        <h2 class="title">Select items:</h2>
        <table class="m-0 w-full mb-3">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each selecteditems as row}
                <tr class="hover">
                    <td><h2>{row.id}</h2></td>
                    <td><h2>{row.itemname}</h2></td>
                    <td class="p-0">
                        <input type="checkbox" 
                        value="{row.id} {row.itemname}"
                        name="{row.id} {row.itemname}">
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
        <button class="mb-3 w-full submit" onclick="{printBarCode}">Print</button>
        <button class="mb-3 w-full" onclick="{closeModal}">Close</button>
    </div>
</dialog>

