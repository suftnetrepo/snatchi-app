# Replace with your actual keys
FCM_SERVER_KEY=d06f6114f08dd3d3308512621d8f3b9d8893edab
DEVICE_TOKEN=cguHiCboZkxzgMIdOTKinf:APA91bEjzFAoGR6vUpC5j4OeWlNQ2rVYYaxTq_NSUMTI7Dge4kE1Bjx4Y2ZO443xKBPcZ6CnrH2XaMCc1AdvF7L9hWjAr0No4KrLRMy3ZnQf2fEcqtxz_kE

.PHONY: add remove clear alert toast

.PHONY: add alert toast

add:
	node send-fcm.js add.json

alert:
	node send-fcm.js alert.json

toast:
	node send-fcm.js toast.json