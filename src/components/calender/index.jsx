import React, {useRef} from 'react';
import Calendar from 'react-native-deadsimple-calendar';
import { theme } from '../../utils/theme';


const CalendarTasks = ({onSelect, date}) => {
  const formatDate = ({date, month, year}) => {
    const formattedDate = date.toString().padStart(2, '0'); // Add leading zero if needed
    const formattedMonth = (month + 1).toString().padStart(2, '0'); // Convert month to 1-based index
    return `${formattedDate}-${formattedMonth}-${year}`;
  };

  return (
    <>
      <Calendar
      HeaderStyle={{
        backgroundColor : 'white'
      }}
      RightArrowStyle={{
        backgroundColor : theme.colors.pink[500]
      }}
      TitleStyle={{
        backgroundColor : theme.colors.cyan[500]
      }}
      SelectedWrapperStyle={{
            backgroundColor : theme.colors.pink[500]
      }}
        InlineStrip={true}
        OnDatePressed={newDate => {
          console.log(newDate);
          onSelect(formatDate(newDate));
        }}
      />
    </>
  );
};

export default CalendarTasks;
