import datetime
import time

# Function to check if it's time for any reminder
def check_reminders(current_time):
    with open("_Time.txt", "r") as time_file:
        lines = time_file.readlines()
        for i, line in enumerate(lines):
            reminder_time = line.strip()
            if current_time == reminder_time:
                with open("_Activity.txt", "r") as activity_file:
                    activities = activity_file.readlines()
                    activity = activities[i].strip()
                    i = 5
                    while (i > 0):
                        print(f"Time is up for: {activity}")
                        time.sleep(5)
                        i = i - 1

            else:
                print("no activity")
                break

# Main loop
def main():
    # Get current time
    current_time = datetime.datetime.now().strftime('%H%M')

    # Check if it's time for any reminder
    check_reminders(current_time)
    
#main()
    
