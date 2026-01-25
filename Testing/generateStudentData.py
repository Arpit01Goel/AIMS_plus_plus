import csv
import random

# Number of students
NUM_STUDENTS = 1000

# Data pools
first_names = [
    "Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Krishna","Ishaan","Aryan","Atharva",
    "Ananya","Diya","Kavya","Isha","Aditi","Riya","Pooja","Sneha","Neha","Shreya",
    "Rahul","Rohan","Aman","Kunal","Siddharth","Abhishek","Nikhil","Yash","Mohit","Varun",
    "Priya","Nisha","Pallavi","Swati","Anjali","Kriti","Simran","Sakshi","Megha","Tanvi"
]

last_names = [
    "Sharma","Verma","Gupta","Agarwal","Mehta","Jain","Patel","Shah","Iyer","Nair",
    "Reddy","Rao","Naidu","Chowdhury","Banerjee","Mukherjee","Ghosh","Das","Malhotra",
    "Kapoor","Khanna","Arora","Bansal","Singh","Kumar","Yadav","Mishra","Pandey","Tiwari"
]

departments = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Mathematics",
    "Physics"
]

degrees = [
    "B.Tech",
    "M.Tech",
    "PhD"
]

years_of_entry = [2019, 2020, 2021, 2022, 2023, 2024]

# Create CSV
with open("students.csv", mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)

    # Header
    writer.writerow([
        "login_id",
        "email",
        "first_name",
        "last_name",
        "role",
        "org_id",
        "department",
        "degree",
        "year_of_entry"
    ])

    for i in range(1, NUM_STUDENTS + 1):
        year = random.choice(years_of_entry)
        dept = random.choice(departments)
        degree = random.choice(degrees)

        first = random.choice(first_names)
        last = random.choice(last_names)

        login_id = f"student{i}"
        email = f"student{i}@iitrpr.ac.in"
        role = "STU"
        org_id = f"{year}CSB{1000 + i}"

        writer.writerow([
            login_id,
            email,
            first,
            last,
            role,
            org_id,
            dept,
            degree,
            year
        ])

print("✅ students.csv generated successfully!")
