const courseList = [
    // nd1 first semester
    {
        title: "Introduction to Computing",
        level_id: 1,
        semester_id: 1,
        code: "com101",
    },
    {
        title: "Intorduction to Digital Electronics",
        level_id: 1,
        semester_id: 1,
        code: "com112",
    },
    {
        title: "Intorduction to Programming",
        level_id: 1,
        semester_id: 1,
        code: "com113",
    },
    {
        title: "PC Upgrade and Maintenance",
        level_id: 1,
        semester_id: 1,
        code: "com114",
    },
    {
        title: "Intorduction to LINUX OS",
        level_id: 1,
        semester_id: 1,
        code: "com115",
    },
    {
        title: "Descriptive Statistics",
        level_id: 1,
        semester_id: 1,
        code: "Sta111",
    },
    {
        title: "Elementary Probability Theory",
        level_id: 1,
        semester_id: 1,
        code: "sta112",
    },
    {
        title: "Logic and Linear Algebra",
        level_id: 1,
        semester_id: 1,
        code: "mth111",
    },
    {
        title: "Trig and Analytical Geometry",
        level_id: 1,
        semester_id: 1,
        code: "mth112",
    },
    {
        title: "Use of English",
        level_id: 1,
        semester_id: 1,
        code: "gns101",
    },
    {
        title: "Citizenship Education",
        level_id: 1,
        semester_id: 1,
        code: "gns127",
    },
    // nd1 second semester
    {
        title: "Scientific Programming using  O.O JAVA",
        level_id: 1,
        semester_id: 2,
        code: "com121",
    },
    {
        title: "Introduction to Internet",
        level_id: 1,
        semester_id: 2,
        code: "com122",
    },
    {
        title: "Computer Application Package 1",
        level_id: 1,
        semester_id: 2,
        code: "com123",
    },
    {
        title: "Data Structure and Algorithm",
        level_id: 1,
        semester_id: 2,
        code: "com124",
    },
    {
        title: "Intro. to System Analysis",
        level_id: 1,
        semester_id: 2,
        code: "com125",
    },
    {
        title: "Programming in C",
        level_id: 1,
        semester_id: 2,
        code: "com126",
    },
    {
        title: "Intro. to Discrete Mathematics",
        level_id: 1,
        semester_id: 2,
        code: "com127",
    },
    {
        title: "Communition in English 1",
        level_id: 1,
        semester_id: 2,
        code: "gns102",
    },
    {
        title: "Citizenship Education 2",
        level_id: 1,
        semester_id: 2,
        code: "gns128",
    },
    {
        title: "Entrepreneurship Development",
        level_id: 1,
        semester_id: 2,
        code: "eed126",
    },
    // nd2 first semester
    {
        title: "Programming in  O.O BASIC",
        level_id: 2,
        semester_id: 1,
        code: "com211",
    },
    {
        title: "System Programming",
        level_id: 2,
        semester_id: 1,
        code: "com212",
    },
    {
        title: "Programming in  O.O COBOL",
        level_id: 2,
        semester_id: 1,
        code: "com213",
    },
    {
        title: "File Management and Org.",
        level_id: 2,
        semester_id: 1,
        code: "com214",
    },
    {
        title: "Computer Packages 2",
        level_id: 2,
        semester_id: 1,
        code: "com215",
    },
    {
        title: "Computer System Troubleshooting 1",
        level_id: 2,
        semester_id: 1,
        code: "com216",
    },
    {
        title: "Management Information Systemn",
        level_id: 2,
        semester_id: 1,
        code: "com217",
    },
    {
        title: "Entrepreneurship Developemnt 2",
        level_id: 2,
        semester_id: 1,
        code: "eed216",
    },
    {
        title: "Use of English 2",
        level_id: 2,
        semester_id: 1,
        code: "gns201",
    },
    // nd2 second semester
    {
        title: "Programming in O.O FORTRAN",
        level_id: 2,
        semester_id: 2,
        code: "com221",
    },
    {
        title: "Seminar on COmputer & Society",
        level_id: 2,
        semester_id: 2,
        code: "com222",
    },
    {
        title: "Basic Hardware Maintenance",
        level_id: 2,
        semester_id: 2,
        code: "com223",
    },
    {
        title: "Web Technology",
        level_id: 2,
        semester_id: 2,
        code: "com224",
    },
    {
        title: "Computer System Troubleshooting 2",
        level_id: 2,
        semester_id: 2,
        code: "com225",
    },
    {
        title: "Communication in English 2",
        level_id: 2,
        semester_id: 2,
        code: "gns202",
    },
    {
        title: "Calculus",
        level_id: 2,
        semester_id: 2,
        code: "mth209",
    },
    {
        title: "Project",
        level_id: 2,
        semester_id: 2,
        code: "com229",
    },
    // hnd1 first semester
    {
        title: "Operating System 1",
        level_id: 3,
        semester_id: 1,
        code: "com311",
    },
    {
        title: "Database Design 1",
        level_id: 3,
        semester_id: 1,
        code: "com312",
    },
    {
        title: "Computer PRogramming USing C++",
        level_id: 3,
        semester_id: 1,
        code: "com313",
    },
    {
        title: "Computer Architecture",
        level_id: 3,
        semester_id: 1,
        code: "com314",
    },
    {
        title: "Operational Research 1",
        level_id: 3,
        semester_id: 1,
        code: "com315",
    },
    {
        title: "Statistical Theory 1",
        level_id: 3,
        semester_id: 1,
        code: "sta311",
    },
    {
        title: "Use of English 3",
        level_id: 3,
        semester_id: 1,
        code: "gns301",
    },
    // hnd1 second semester
    {
        title: "Operating System 2",
        level_id: 3,
        semester_id: 2,
        code: "com321",
    },
    {
        title: "Database Design 2",
        level_id: 3,
        semester_id: 2,
        code: "com322",
    },
    {
        title: "Assembly Language",
        level_id: 3,
        semester_id: 2,
        code: "com323",
    },
    {
        title: "Introduxtion to Software Engineering",
        level_id: 3,
        semester_id: 2,
        code: "com324",
    },
    {
        title: "Introduction to Human-Computer Interface (HCI)",
        level_id: 3,
        semester_id: 2,
        code: "com326",
    },
    {
        title: "Statistic 2",
        level_id: 3,
        semester_id: 2,
        code: "sta321",
    },
    {
        title: "Commuication in English 3",
        level_id: 3,
        semester_id: 2,
        code: "gns302",
    },
    // hnd2 first semester
    {
        title: "Computer Programming in O.O Pascal",
        level_id: 4,
        semester_id: 1,
        code: "com411",
    },
    {
        title: "Project Management",
        level_id: 4,
        semester_id: 1,
        code: "com412",
    },
    {
        title: "Compiler Construction",
        level_id: 4,
        semester_id: 1,
        code: "com413",
    },
    {
        title: "Data Communication and Networkings",
        level_id: 4,
        semester_id: 1,
        code: "com414",
    },
    {
        title: "Multimedia",
        level_id: 4,
        semester_id: 1,
        code: "com415",
    },
    {
        title: "Seminar on current topic in Computing",
        level_id: 4,
        semester_id: 1,
        code: "com416",
    },
    {
        title: "Communication in English 4",
        level_id: 4,
        semester_id: 1,
        code: "gns401",
    },
    {
        title: "Entrepreneurship Development 4",
        level_id: 4,
        semester_id: 2,
        code: "eed416",
    },
    // hnd2 second semester
    {
        title: "Computer Graphics and Animation",
        level_id: 4,
        semester_id: 2,
        code: "com421",
    },
    {
        title: "Introduction to Artificial Intelligence and Expert Systems",
        level_id: 4,
        semester_id: 2,
        code: "com422",
    },
    {
        title: "Professional Practice in IT",
        level_id: 4,
        semester_id: 2,
        code: "com423",
    },
    {
        title: "Operational Research 2",
        level_id: 4,
        semester_id: 2,
        code: "com424",
    },
    {
        title: "Final Project",
        level_id: 4,
        semester_id: 2,
        code: "com419",
    },
];
module.exports = courseList