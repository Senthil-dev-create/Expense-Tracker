// Set the max date to today's date on page load
document.addEventListener("DOMContentLoaded", function() {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    document.getElementById("date").setAttribute("max", today);  // Set the max date for the date input field
});

document.getElementById("expense-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const date = document.getElementById("date").value;
    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;

    if (!date || !amount || !description) {
        showMessage("Please fill out all fields.", "error", "expense-message");
        return;
    }

    const expense = { date, amount: parseFloat(amount), description };
    
    // Add expense to localStorage
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    // Clear the form
    document.getElementById("expense-form").reset();

    // Show success message
    showMessage("Expense added successfully!", "success", "expense-message");

    // Update the summary
    displayExpenses();
    displayMonthlySummary();  // Refresh monthly summary
});

// Function to format date as DD-MM-YY
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed
    const year = date.getFullYear().toString().slice(2);  // Last 2 digits of year
    return `${day}-${month}-${year}`;
}

// Function to display expenses in the summary section
function displayExpenses() {
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    const tableBody = document.getElementById("expense-table").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";  // Clear any existing rows

    // Sort expenses by date
    expenses.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Populate the table with Date, Amount, and Description
    expenses.forEach((expense, index) => {
        const row = tableBody.insertRow();

        // Select Checkbox Column
        const selectCell = row.insertCell(0);
        const selectCheckbox = document.createElement("input");
        selectCheckbox.type = "checkbox";
        selectCheckbox.dataset.index = index; // Store index for deletion
        selectCheckbox.addEventListener("change", toggleDeleteButtonVisibility);
        selectCell.appendChild(selectCheckbox);

        // Date Column (formatted)
        const dateCell = row.insertCell(1);
        dateCell.textContent = formatDate(expense.date);

        // Amount Column
        const amountCell = row.insertCell(2);
        amountCell.textContent = expense.amount.toFixed(2);

        // Description Column
        const descriptionCell = row.insertCell(3);
        descriptionCell.textContent = expense.description;
    });
}

// Function to delete selected expenses
document.getElementById("delete-selected").addEventListener("click", function() {
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    const checkboxes = document.querySelectorAll("#expense-table input[type='checkbox']:checked");

    if (checkboxes.length === 0) {
        showMessage("No expenses selected for deletion.", "error", "delete-message");
        return;
    }

    const selectedIndexes = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.index));

    // Filter out the selected expenses from the list
    const updatedExpenses = expenses.filter((expense, index) => !selectedIndexes.includes(index));

    // Update localStorage with the new list
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    // Show success message and update the summary
    showMessage("Expense(s) deleted successfully!", "success", "delete-message");
    displayExpenses();
    displayMonthlySummary();  // Refresh monthly summary
});

// Function to display monthly summary
function displayMonthlySummary() {
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    const groupedByDate = {};

    // Group expenses by date and calculate total for each date
    expenses.forEach(expense => {
        const date = formatDate(expense.date);
        if (!groupedByDate[date]) {
            groupedByDate[date] = 0;
        }
        groupedByDate[date] += expense.amount;
    });

    const tableBody = document.getElementById("monthly-summary-table").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";  // Clear any existing rows

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    document.getElementById("monthly-header").textContent = `${currentMonth} - Summary`;

    // Populate the table with day-wise totals
    Object.keys(groupedByDate).forEach(date => {
        const row = tableBody.insertRow();

        // Date Column
        const dateCell = row.insertCell(0);
        dateCell.textContent = date;

        // Total Amount Column
        const totalCell = row.insertCell(1);
        totalCell.textContent = groupedByDate[date].toFixed(2);
    });
}

// Function to display success or error messages
function showMessage(message, type, elementId) {
    const messageBox = document.getElementById(elementId);
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = "block";

    // Hide the message after 3 seconds
    setTimeout(() => {
        messageBox.style.display = "none";
    }, 3000);
}

// Toggle the visibility of the "Delete Selected" button based on checkbox selection
function toggleDeleteButtonVisibility() {
    const checkboxes = document.querySelectorAll("#expense-table input[type='checkbox']:checked");
    const deleteButton = document.getElementById("delete-selected");

    if (checkboxes.length > 0) {
        deleteButton.style.display = "block";  // Show the delete button if at least one checkbox is checked
    } else {
        deleteButton.style.display = "none";   // Hide the delete button if no checkboxes are checked
    }
}

// Menu functionality to switch between expense entry, summary, and monthly summary
document.getElementById("show-expenses").addEventListener("click", function() {
    // Show the expense form and hide both summary and monthly summary
    document.getElementById("expense-form-container").style.display = "block";
    document.getElementById("summary-container").style.display = "none";
    document.getElementById("monthly-summary-container").style.display = "none";
});

document.getElementById("show-summary").addEventListener("click", function() {
    // Show the summary and hide the expense form and monthly summary
    document.getElementById("expense-form-container").style.display = "none";
    document.getElementById("summary-container").style.display = "block";
    document.getElementById("monthly-summary-container").style.display = "none";
    displayExpenses();  // Refresh the summary table
});

document.getElementById("show-monthly-summary").addEventListener("click", function() {
    // Show the monthly summary and hide the expense form and summary
    document.getElementById("expense-form-container").style.display = "none";
    document.getElementById("summary-container").style.display = "none";
    document.getElementById("monthly-summary-container").style.display = "block";
    displayMonthlySummary();  // Refresh monthly summary
});

// Initially hide the delete button
document.getElementById("delete-selected").style.display = "none";
