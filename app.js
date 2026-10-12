
const SUPABASE_URL = 'https://mbxpmnczhulcbqgwutjl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ieHBtbmN6aHVsY2JxZ3d1dGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzgyOTcsImV4cCI6MjEwNjc1NDI5N30.wqH8zfcA25vmes_5sp0_jW81NM-5VIxmOPNQ3bQRduY';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);





const studentForm = document.getElementById("studentForm");
const studentId = document.getElementById("studentId");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentCourse = document.getElementById("studentCourse");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

const studentTableBody = document.getElementById("studentTableBody");
const message = document.getElementById("message");



// SUCCESS AND ERROR MESSAGES


function showMessage(text, type = "success") {
    message.textContent = text;

    message.style.color =
        type === "success" ? "#15803d" : "#dc2626";
}


//  FETCH STUDENt 

async function fetchStudents() {
    studentTableBody.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");

    loadingCell.colSpan = 5;
    loadingCell.textContent = "Loading students...";

    loadingRow.appendChild(loadingCell);
    studentTableBody.appendChild(loadingRow);

    const { data, error } = await supabaseClient
        .from("students")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        studentTableBody.replaceChildren();
        showMessage(error.message, "error");
        return;
    }

    studentTableBody.replaceChildren();

    if (!data || data.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No students found.";

        row.appendChild(cell);
        studentTableBody.appendChild(row);
        return;
    }

    data.forEach(function (student) {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = student.id;

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const emailCell = document.createElement("td");
        emailCell.textContent = student.email;

        const courseCell = document.createElement("td");
        courseCell.textContent = student.course;

        const actionCell = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";

        editBtn.addEventListener("click", function () {
            editStudent(student);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", function () {
            deleteStudent(student.id);
        });

        actionCell.append(editBtn, deleteBtn);

        row.append(
            idCell,
            nameCell,
            emailCell,
            courseCell,

            actionCell
        );

        studentTableBody.appendChild(row);
    });
}



//  ADD OR UPDATE STUDENT


studentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = studentName.value.trim();
    const email = studentEmail.value.trim();
    const course = studentCourse.value.trim();

    if (!name || !email || !course) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    const emailInput = studentEmail;

    if (!emailInput.validity.valid) {
        showMessage("Please enter a valid email.", "error");
        return;
    }

    const studentData = {
        name: name,
        email: email,
        course: course
    };

    submitBtn.disabled = true;

    try {
        let result;

        if (studentId.value) {
            // UPDATE EXISTING STUDENT

            result = await supabaseClient
                .from("students")
                .update(studentData)
                .eq("id", Number(studentId.value))
                .select();

        } else {
            // INSERT NEW STUDENT

            result = await supabaseClient
                .from("students")
                .insert([studentData])
                .select();
        }

        if (result.error) {
            showMessage(result.error.message, "error");
            return;
        }

        if (!result.data || result.data.length === 0) {
            showMessage(
                "No record was changed. Check your database permissions.",
                "error"
            );
            return;
        }

        const wasEditing = Boolean(studentId.value);

        showMessage(
            wasEditing
                ? "Student updated successfully!"
                : "Student added successfully!"
        );

        studentForm.reset();
        resetForm();

        await fetchStudents();

    } catch (error) {
        showMessage(error.message || "Something went wrong.", "error");

    } finally {
        submitBtn.disabled = false;
    }
});


//  EDIT STUDENT


function editStudent(student) {
    studentId.value = student.id;
    studentName.value = student.name;
    studentEmail.value = student.email;
    studentCourse.value = student.course;

    formTitle.textContent = "Edit Student";
    submitBtn.textContent = "Update Student";
    cancelBtn.hidden = false;

    showMessage("Edit the student details and click Update.");

    studentForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}



// 7. DELETE STUDENT


async function deleteStudent(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("students")
        .delete()
        .eq("id", id)
        .select();

    if (error) {
        showMessage(error.message, "error");
        return;
    }

    if (!data || data.length === 0) {
        showMessage(
            "Student was not deleted. Check database permissions.",
            "error"
        );
        return;
    }

    showMessage("Student deleted successfully!");

    if (studentId.value === String(id)) {
        studentForm.reset();
        resetForm();
    }

    await fetchStudents();
}


//  RESET FORM


function resetForm() {
    studentId.value = "";

    formTitle.textContent = "Add New Student";
    submitBtn.textContent = "Add Student";

    cancelBtn.hidden = true;
}



//  CANCEL EDIT


cancelBtn.addEventListener("click", function () {
    studentForm.reset();
    resetForm();

    showMessage("Edit cancelled.");
});


// LOAD STUDENTS WHEN PAGE OPENS


fetchStudents();
