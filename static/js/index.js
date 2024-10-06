// Parse the JSON content from the element
const json_content = JSON.parse(document.querySelector('#json_content').textContent);

// Select the form where the lists will be appended
const form = document.querySelector('.forms');

// Clear existing content in the form (if needed) // Clear previous content if any

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

        // Create content for the list item
        listItem.innerHTML = `
            <div>
                <img src="${ind.picture}" alt="${ind.name}" style="width:200px; height:auto; margin-right:10px;">
                <span style='text-transform: capitalize;'>${ind.name}</span>
            </div>
            <input type="radio" name="list_item_category_${categoryName}" value="${ind.id}">
        `;

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
button.classList.add('btn');
button.classList.add('btn-success');

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