// Parse the JSON content from the element
const json_content = JSON.parse(document.querySelector('#json_content').textContent);

// Select the form where the lists will be appended
const form = document.querySelector('.forms');

// Iterate through the parsed JSON content
json_content.forEach((content) => {
    // Get the category name and individuals
    const categoryName = content.category;
    const individuals = content.individuals;

    // Create a new div for the category
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('mb-4'); // Add some margin at the bottom

    // Create a header for the category
    const categoryHeader = document.createElement('h5');
    categoryHeader.textContent = categoryName; // Set category name
    categoryHeader.style.textTransform = 'capitalize';

    // Create a list group for the individuals
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group'); // Bootstrap list group class

    // Populate the list with individuals
    individuals.forEach((ind) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center'); // Bootstrap classes for list item

        // Create a unique id for the radio input
        const radioId = `radio_${ind.id}`;

        // Create content for the list item with a label that acts like a button
        listItem.innerHTML = `
            <div>
                <img src="${ind.picture}" alt="${ind.name}" style="width:125px; height:auto; margin-right:10px;">
                <span style='text-transform: capitalize; margin: 25px; font-size: 1.105rem; font-weight: 500;'>${ind.name}</span>
            </div>
            <input type="radio" id="${radioId}" name="list_item_category_${categoryName}" value="${ind.id}" style="display:none;">
            <label for="${radioId}" class="btn btn-outline-primary me-2 vote-button">
                Vote
            </label>
        `;

        // Add click event to the label to change its appearance and mark the vote
        const input = listItem.querySelector(`input[type="radio"]`);
        const label = listItem.querySelector(`label[for="${radioId}"]`);

        label.addEventListener('click', () => {
            // Deselect other radio buttons in the same group
            const radios = form.querySelectorAll(`input[name="list_item_category_${categoryName}"]`);
            radios.forEach(r => {
                if (r !== input) {
                    r.checked = false; // Deselect other radios
                    // Reset other labels to original state
                    const otherLabel = form.querySelector(`label[for="${r.id}"]`);
                    otherLabel.classList.remove('btn-primary');
                    otherLabel.classList.add('btn-outline-primary');
                    otherLabel.textContent = 'Vote'; // Reset text
                }
            });
            input.checked = true; // Select this radio button

            // Change the label to indicate the vote has been registered
            label.classList.remove('btn-outline-primary');
            label.classList.add('btn-primary'); // Change button to primary
            label.textContent = 'Voted'; // Change text to Voted
        });

        // Append the new list item to the list group
        listGroup.appendChild(listItem);
    });

    // Append the category header and the list group to the category div
    categoryDiv.appendChild(categoryHeader);
    categoryDiv.appendChild(listGroup);

    // Append the category div to the form
    form.appendChild(categoryDiv);
});

// Create a submit button
const button = document.createElement('button');
button.type = 'button'; // Change type to button to avoid immediate submission
button.textContent = 'Submit Forms';
button.classList.add('btn', 'btn-success');

// Add an event listener to handle the form submission
button.addEventListener('click', () => {
    // Check if a selection has been made in each category
    const categories = [...new Set(json_content.map(content => content.category))]; // Get unique categories
    let allSelected = true;

    categories.forEach(category => {
        const selected = form.querySelector(`input[name="list_item_category_${category}"]:checked`);
        if (!selected) {
            allSelected = false; // If any category has no selection, set to false
            alert(`Please select one individual from the category: ${category}`); // Alert user
        }
    });

    if (allSelected) {
        form.submit(); // Submit the form if all categories have a selection
    }
});

// Append the button to the form
form.appendChild(button);

// Debugging logs
console.log(json_content);