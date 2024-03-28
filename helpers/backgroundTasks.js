const conn = require('../connection/db');
const { sendNotification } = require('./sendReminder');

const sleep = ms => new Promise(res => setTimeout(res, ms));

const startBackgroundTasks = async () => {
  while(true) {
    await sleep(2000);

    // Array to hold the number of days ahead to check
    const daysAheadArray = [6, 3, 1];

    for (let daysAhead of daysAheadArray) {
      // Calculate the target date
      let targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);
      targetDate = targetDate.toISOString().split('T')[0];
      console.log(`Checking for records with event_date = ${targetDate}`);

      // Fetch records where the event_date is daysAhead days ahead
      const query = `SELECT PH.history_id AS history_id, PH.event_name AS event_name, PH.event_description AS event_description, PH.event_date AS event_date, P.pet_name AS pet_name
                        FROM pethistory PH
                        JOIN petprofiles P ON PH.pet_id = P.pet_id
                        WHERE PH.event_date = ?;`;
      conn.query(query, [targetDate], async (error, results) => {
        if (error) {
          throw error;
        }

        for (let row of results) {
          let reminderMessage = ``;
          if(daysAhead == 1) {
            reminderMessage = `${row.event_name} for ${row.pet_name} is due tommorow!`;
          } else {
            reminderMessage = `${row.event_name} for ${row.pet_name} is due in ${daysAhead} days!`;
          }

          try {
            let notificationDate = new Date().toISOString();
            const response = await sendNotification(`dUR6eHK-QzGqVK-U8-LUF7:APA91bEh-OueJXzd0Rgl555CoDaxg64Z78JyIg8O-k2rxBvnJvE7c5aabOgx0t5VxZ7q23IJf-iYxytCV3traDnZv14G4owKRBHfoXFAY8rZu326GFBCjUQCKwRJlkRvXG93NP_nvcdw`, // Assuming each row has an fcmtoken field
                                                    "Vaccination Reminder", 
                                                    reminderMessage, 
                                                    {
                                                      type: "reminder",
                                                      title: "Vaccination Reminder",
                                                      body: reminderMessage,
                                                      notificationDate: notificationDate,
                                                      eventDate: targetDate
                                                    });
            console.log(`Notification sent for record: ${row.history_id}, response: ${response}`);
          } catch (error) {
            console.error(`Error sending notification for record: ${row.history_id}`, error);
          }
        }
      });
    }

    await sleep(86400000); // Wait for 24 hours before checking again
  }
};

module.exports = startBackgroundTasks;
