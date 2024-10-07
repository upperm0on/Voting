document.addEventListener('DOMContentLoaded', () => {
    const json_content = JSON.parse(document.querySelector('#json_content').textContent);
    const form = document.querySelector('.forms');

    json_content.forEach((content) => {
        const categoryName = content.category;
        const individuals = content.individuals;

        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('mb-4');

        const categoryHeader = document.createElement('h5');
        categoryHeader.textContent = categoryName;
        categoryHeader.style.textTransform = 'capitalize';

        const listGroup = document.createElement('ul');
        listGroup.classList.add('list-group');

        individuals.forEach((ind) => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

            const radioId = `radio_${ind.id}`;
            listItem.innerHTML = `
                <div>
                    <img src="${ind.picture}" alt="${ind.name}" style="width:125px; height:auto; margin-right:10px; border-radius: 15px;">
                    <span style='text-transform: capitalize; margin: 25px; font-size: 1.105rem; font-weight: 500;'>${ind.name}</span>
                </div>
                <input type="radio" id="${radioId}" name="${categoryName}" value="${ind.id}" style="display:none;">
                <label for="${radioId}" class="btn btn-outline-primary me-2 vote-button">
                    Vote
                </label>
            `;

            const input = listItem.querySelector(`input[type="radio"]`);
            const label = listItem.querySelector(`label[for="${radioId}"]`);

            label.addEventListener('click', () => {
                const radios = form.querySelectorAll(`input[name="${categoryName}"]`);
                radios.forEach(r => {
                    if (r !== input) {
                        r.checked = false;
                        const otherLabel = form.querySelector(`label[for="${r.id}"]`);
                        otherLabel.classList.remove('btn-primary');
                        otherLabel.classList.add('btn-outline-primary');
                        otherLabel.textContent = 'Vote';
                    }
                });
                input.checked = true;
                label.classList.remove('btn-outline-primary');
                label.classList.add('btn-primary');
                label.textContent = 'Voted';
            });

            listGroup.appendChild(listItem);
        });

        categoryDiv.appendChild(categoryHeader);
        categoryDiv.appendChild(listGroup);
        form.appendChild(categoryDiv);
    });

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Submit Forms';
    button.classList.add('btn', 'btn-success');

    button.addEventListener('click', () => {
        const categories = [...new Set(json_content.map(content => content.category))];
        let allSelected = true;

        categories.forEach(category => {
            const selected = form.querySelector(`input[name="${category}"]:checked`);
            if (!selected) {
                allSelected = false;
                alert(`Please select one individual from the category: ${category}`);
            }
        });

        if (allSelected) {
            form.submit();
        }
    });

    form.appendChild(button);
});
