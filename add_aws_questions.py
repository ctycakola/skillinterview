import json
import os

new_questions = [
  {
    "uid": "aws-41",
    "category": "AWS",
    "topic": "DynamoDB",
    "difficulty": "Beginner",
    "question": "What is DynamoDB?",
    "answer": "Amazon DynamoDB is a fully managed, highly available, Serverless NoSQL database service that provides fast and predictable performance with seamless scalability.",
    "code": "",
    "output": "",
    "tips": ["Emphasize 'fully managed' and 'NoSQL'."],
    "mistakes": ["Confusing it with a relational database like RDS."],
    "related": ["Difference between SQL and NoSQL?"]
  },
  {
    "uid": "aws-42",
    "category": "AWS",
    "topic": "DynamoDB",
    "difficulty": "Intermediate",
    "question": "Difference between SQL and NoSQL?",
    "answer": "SQL databases (like MySQL) are relational, use structured schemas, and scale vertically. NoSQL databases (like DynamoDB) are non-relational, have dynamic/flexible schemas (key-value or document), and scale horizontally.",
    "code": "",
    "output": "",
    "tips": [],
    "mistakes": [],
    "related": []
  },
  {
    "uid": "aws-43",
    "category": "AWS",
    "topic": "DynamoDB",
    "difficulty": "Advanced",
    "question": "Primary Key Types in DynamoDB?",
    "answer": "There are two types of primary keys in DynamoDB: \n1. Partition Key (simple primary key): Composed of one attribute. DynamoDB uses the partition key's value as input to an internal hash function.\n2. Partition Key and Sort Key (composite primary key): Composed of two attributes, allowing multiple items to have the same partition key as long as they have different sort keys.",
    "code": "",
    "output": "",
    "tips": [],
    "mistakes": [],
    "related": ["What is Partition Key?", "What is Sort Key?"]
  },
  {
    "uid": "aws-44",
    "category": "AWS",
    "topic": "Lambda",
    "difficulty": "Beginner",
    "question": "What is AWS Lambda?",
    "answer": "AWS Lambda is a serverless compute service that lets you run code without provisioning or managing servers. You only pay for the compute time you consume—there is no charge when your code is not running.",
    "code": "",
    "output": "",
    "tips": ["Lambda is event-driven; it runs code in response to events."],
    "mistakes": [],
    "related": ["Benefits of Serverless?"]
  },
  {
    "uid": "aws-45",
    "category": "AWS",
    "topic": "Lambda",
    "difficulty": "Intermediate",
    "question": "Benefits of Serverless?",
    "answer": "1. No servers to provision or manage.\n2. Scales automatically with usage.\n3. Pay only for what you use (idle time costs nothing).\n4. Built-in high availability and fault tolerance.",
    "code": "",
    "output": "",
    "tips": [],
    "mistakes": ["Saying 'Serverless means there are no servers' (servers exist, but AWS manages them)."],
    "related": []
  },
  {
    "uid": "aws-46",
    "category": "AWS",
    "topic": "Lambda",
    "difficulty": "Intermediate",
    "question": "What is Lambda Timeout?",
    "answer": "The maximum execution time for an AWS Lambda function is 15 minutes (900 seconds). If the function runs longer than the configured timeout, AWS terminates the execution.",
    "code": "",
    "output": "",
    "tips": ["Mention that it's important to set realistic timeouts to avoid paying for stalled code."],
    "mistakes": ["Thinking Lambda can run long-running batch jobs that take hours."],
    "related": []
  },
  {
    "uid": "aws-47",
    "category": "AWS",
    "topic": "API Gateway",
    "difficulty": "Beginner",
    "question": "What is API Gateway?",
    "answer": "Amazon API Gateway is a fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale. It acts as the 'front door' for applications to access data, business logic, or functionality from backend services.",
    "code": "",
    "output": "",
    "tips": [],
    "mistakes": [],
    "related": ["Types of APIs?"]
  },
  {
    "uid": "aws-48",
    "category": "AWS",
    "topic": "API Gateway",
    "difficulty": "Intermediate",
    "question": "Difference between REST and HTTP API?",
    "answer": "REST APIs offer extensive API management features (API keys, throttling, complex transformations). HTTP APIs are designed for minimal overhead, lower latency, and cost up to 71% less than REST APIs, but lack some of the advanced management features.",
    "code": "",
    "output": "",
    "tips": [],
    "mistakes": [],
    "related": []
  },
  {
    "uid": "aws-49",
    "category": "AWS",
    "topic": "CloudWatch",
    "difficulty": "Beginner",
    "question": "What is CloudWatch?",
    "answer": "Amazon CloudWatch is a monitoring and observability service built for DevOps engineers, developers, site reliability engineers (SREs), and IT managers. It collects monitoring and operational data in the form of logs, metrics, and events.",
    "code": "",
    "output": "",
    "tips": ["CloudWatch = Performance Monitoring."],
    "mistakes": ["Confusing CloudWatch (performance) with CloudTrail (auditing)."],
    "related": ["What are Metrics?", "Difference between CloudTrail and CloudWatch?"]
  },
  {
    "uid": "aws-50",
    "category": "AWS",
    "topic": "CloudWatch",
    "difficulty": "Intermediate",
    "question": "What are CloudWatch Metrics and Alarms?",
    "answer": "Metrics are numerical data points representing the performance of a system over time (e.g., CPU utilization). Alarms watch a specific metric and perform one or more actions (like sending an SNS notification or triggering Auto Scaling) if the metric breaches a defined threshold.",
    "code": "",
    "output": "",
    "tips": [],
    "mistakes": [],
    "related": []
  },
  {
    "uid": "aws-51",
    "category": "AWS",
    "topic": "CloudTrail",
    "difficulty": "Beginner",
    "question": "What is CloudTrail?",
    "answer": "AWS CloudTrail is a service that enables governance, compliance, operational auditing, and risk auditing of your AWS account. It records all API calls made within your AWS account.",
    "code": "",
    "output": "",
    "tips": ["CloudTrail = Auditing (Who did what, when, and from where)."],
    "mistakes": [],
    "related": ["Difference between CloudTrail and CloudWatch?"]
  },
  {
    "uid": "aws-52",
    "category": "AWS",
    "topic": "Monitoring",
    "difficulty": "Intermediate",
    "question": "Difference between CloudTrail and CloudWatch?",
    "answer": "CloudWatch monitors the **performance** of your AWS resources and applications (e.g., high CPU usage). CloudTrail monitors the **API activity** in your AWS environment for auditing purposes (e.g., who terminated an EC2 instance).",
    "code": "",
    "output": "",
    "tips": ["Remember: Watch = What is happening (Metrics); Trail = Who did it (Audit)."],
    "mistakes": [],
    "related": []
  },
  {
    "uid": "aws-53",
    "category": "AWS",
    "topic": "SNS & SQS",
    "difficulty": "Beginner",
    "question": "What is SNS?",
    "answer": "Amazon Simple Notification Service (SNS) is a highly available, durable, secure, fully managed pub/sub messaging service that enables you to decouple microservices, distributed systems, and serverless applications.",
    "code": "",
    "output": "",
    "tips": ["SNS is Push-based."],
    "mistakes": [],
    "related": ["Difference between SNS and SQS?"]
  },
  {
    "uid": "aws-54",
    "category": "AWS",
    "topic": "SNS & SQS",
    "difficulty": "Beginner",
    "question": "What is SQS?",
    "answer": "Amazon Simple Queue Service (SQS) is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications.",
    "code": "",
    "output": "",
    "tips": ["SQS is Pull-based (receivers must poll the queue)."],
    "mistakes": [],
    "related": ["Difference between SNS and SQS?"]
  },
  {
    "uid": "aws-55",
    "category": "AWS",
    "topic": "SNS & SQS",
    "difficulty": "Intermediate",
    "question": "Difference between SNS and SQS?",
    "answer": "SNS is a **pub/sub (publish/subscribe) system** where messages are pushed to multiple subscribers instantly. SQS is a **message queue system** where consumers poll (pull) messages from a queue and process them one by one.",
    "code": "",
    "output": "",
    "tips": ["SNS = Push, SQS = Pull. They are often used together (fan-out pattern)."],
    "mistakes": [],
    "related": []
  },
  {
    "uid": "aws-56",
    "category": "AWS",
    "topic": "SNS & SQS",
    "difficulty": "Advanced",
    "question": "What is a FIFO Queue?",
    "answer": "A First-In-First-Out (FIFO) SQS queue guarantees that messages are processed exactly once, in the exact order that they are sent.",
    "code": "",
    "output": "",
    "tips": ["Contrast with standard queues, which offer 'best-effort' ordering and 'at-least-once' delivery."],
    "mistakes": [],
    "related": ["What is a Dead Letter Queue?"]
  },
  {
    "uid": "aws-57",
    "category": "AWS",
    "topic": "SNS & SQS",
    "difficulty": "Advanced",
    "question": "What is a Dead Letter Queue (DLQ)?",
    "answer": "A Dead Letter Queue is a secondary queue used in SQS and SNS where messages that cannot be processed successfully (after a set number of retries) are sent. This allows you to isolate problematic messages and debug why they failed.",
    "code": "",
    "output": "",
    "tips": [],
    "mistakes": [],
    "related": []
  },
  {
    "uid": "aws-58",
    "category": "AWS",
    "topic": "Containers",
    "difficulty": "Beginner",
    "question": "What is Docker?",
    "answer": "Docker is a software platform that allows you to build, test, and deploy applications quickly. It packages software into standardized units called containers that have everything the software needs to run including libraries, system tools, code, and runtime.",
    "code": "",
    "output": "",
    "tips": [],
    "mistakes": ["Calling containers Virtual Machines. (Containers share the host OS, VMs have their own OS)."],
    "related": ["What is ECS?"]
  },
  {
    "uid": "aws-59",
    "category": "AWS",
    "topic": "Containers",
    "difficulty": "Intermediate",
    "question": "Difference between ECS and EKS?",
    "answer": "Amazon ECS (Elastic Container Service) is an AWS-native container orchestration service that is simple to use and integrates deeply with AWS. Amazon EKS (Elastic Kubernetes Service) is a managed Kubernetes service used to run Kubernetes on AWS without needing to install and operate your own Kubernetes control plane.",
    "code": "",
    "output": "",
    "tips": [],
    "mistakes": [],
    "related": ["What is Fargate?"]
  },
  {
    "uid": "aws-60",
    "category": "AWS",
    "topic": "Containers",
    "difficulty": "Intermediate",
    "question": "What is AWS Fargate?",
    "answer": "AWS Fargate is a serverless compute engine for containers that works with both Amazon ECS and EKS. Fargate removes the need to provision and manage servers (EC2 instances), letting you specify and pay for resources per application.",
    "code": "",
    "output": "",
    "tips": ["Fargate is to containers what Lambda is to code functions."],
    "mistakes": [],
    "related": []
  }
]

file_path = r'c:\Users\rohit\WebstormProjects\skillinterview\data\aws.json'

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = []
else:
    data = []

data.extend(new_questions)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Successfully added {len(new_questions)} questions. Total questions: {len(data)}")
