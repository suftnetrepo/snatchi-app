export const INVOICES = [
  {
    "_id": "603d0f7b9f1b2c001f53a7b2",
    "issueDate": "2023-01-15T00:00:00.000Z",
    "due_on": "2023-02-15T00:00:00.000Z",
    "status": "Unpaid",
    "items": [
      {
        "_id": "603d0f7b9f1b2c001f53a7b2",
        "description": "Legal Advising",
        "quantity": 3,
        "unitPrice": 500,

      },
      {
        "_id": "603d0f7b9f1b2c001f53a7b3",
        "description": "Consultation",
        "quantity": 2,
        "unitPrice": 200,

      }
    ],
    "subtotal": 1900,
    "tax": 100,
    "discount": 50,
    "totalAmount": 1950,
    "notes": "Urgent payment required.",
    "createdAt": "2023-01-15T00:00:00.000Z",
    "updatedAt": "2023-01-15T00:00:00.000Z"
  },
  {
    "_id": "603d0f7b9f1b2c001f53a7b5",
    "issueDate": "2023-03-10T00:00:00.000Z",
    "due_on": "2023-03-25T00:00:00.000Z",
    "status": "Paid",
    "items": [
      {
        "_id": "603d0f7b9f1b2c001f53a7b5",
        "description": "Website Development",
        "quantity": 1,
        "unitPrice": 3000,

      }
    ],
    "subtotal": 3000,
    "tax": 150,
    "discount": 100,
    "totalAmount": 3050,
    "notes": "Project completed successfully.",
    "createdAt": "2023-03-10T00:00:00.000Z",
    "updatedAt": "2023-03-20T00:00:00.000Z"
  },
  {
    "_id": "603d0f7b9f1b2c001f53a7b8",
    "issueDate": "2023-05-05T00:00:00.000Z",
    "due_on": "2023-05-20T00:00:00.000Z",
    "status": "Unpaid",
    "items": [
      {
        "_id": "603d0f7b9f1b2c001f53a7b8",
        "description": "Graphic Design",
        "quantity": 4,
        "unitPrice": 250,

      }
    ],
    "subtotal": 1000,
    "tax": 50,
    "discount": 20,
    "totalAmount": 1030,
    "notes": "Pending client review.",
    "createdAt": "2023-05-05T00:00:00.000Z",
    "updatedAt": "2023-05-10T00:00:00.000Z"
  },
  {
    "_id": "603d0f7b9f1b2c001f53a7b1",
    "issueDate": "2023-07-12T00:00:00.000Z",
    "due_on": "2023-07-27T00:00:00.000Z",
    "status": "Cancelled",
    "items": [
      {
        "_id": "603d0f7b9f1b2c001f53a7b1",
        "description": "Software Consulting",
        "quantity": 5,
        "unitPrice": 600,

      }
    ],
    "subtotal": 3000,
    "tax": 150,
    "discount": 100,
    "totalAmount": 3050,
    "notes": "Project cancelled due to contract issues.",
    "createdAt": "2023-07-12T00:00:00.000Z",
    "updatedAt": "2023-07-20T00:00:00.000Z"
  },
  {
    "_id": "603d0f7b9f1b2c001f53a7c4",
    "task": "603d0f7b9f1b2c001f53a7c5",
    "user": "603d0f7b9f1b2c001f53a7c6",
    "issueDate": "2023-09-08T00:00:00.000Z",
    "due_on": "2023-09-23T00:00:00.000Z",
    "status": "Paid",
    "items": [
      {
        "_id": "603d0f7b9f1b2c001f53a7c4",
        "description": "Database Optimization",
        "quantity": 3,
        "unitPrice": 450,

      }
    ],
    "subtotal": 1350,
    "tax": 75,
    "discount": 50,
    "totalAmount": 1375,
    "notes": "Optimized SQL queries for better performance.",
    "createdAt": "2023-09-08T00:00:00.000Z",
    "updatedAt": "2023-09-15T00:00:00.000Z"
  },
  {
    "_id": "603d0f7b9f1b2c001f53a7c7",
    "issueDate": "2023-11-11T00:00:00.000Z",
    "due_on": "2023-11-26T00:00:00.000Z",
    "status": "Unpaid",
    "items": [
      {
        "_id": "603d0f7b9f1b2c001f53a7c7",
        "description": "SEO Audit",
        "quantity": 2,
        "unitPrice": 300,

      }
    ],
    "subtotal": 600,
    "tax": 30,
    "discount": 10,
    "totalAmount": 620,
    "notes": "Audit report pending submission.",
    "createdAt": "2023-11-11T00:00:00.000Z",
    "updatedAt": "2023-11-18T00:00:00.000Z"
  }
]
