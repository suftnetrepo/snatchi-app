// /* eslint-disable prettier/prettier */
// /* eslint-disable no-undef */
// /* eslint-disable prettier/prettier */
// // import { Share } from 'react-native';
// import RNFS from 'react-native-fs';
// import { Platform } from 'react-native';
// import Share from 'react-native-share';

// const jsonToCSV = (jsonArray) => {
//   const headers = Object.keys(jsonArray[0]);
//   const csvRows = [
//     headers.join(','), // header row
//     ...jsonArray.map(row => 
//       headers.map(header => 
//         JSON.stringify(row[header] || '').replace(/"/g, '""')
//       ).join(',')
//     )
//   ];
//   return csvRows.join('\n');
// };

// const saveCSV = async (csvData) => {
//   const path = Platform.OS === 'ios' ? RNFS.TemporaryDirectoryPath : RNFS.DocumentDirectoryPath;
//   const filePath = `${path}/data.csv`;
  
//   try {
//     await RNFS.writeFile(filePath, csvData, 'utf8');
//     return filePath;
//   } catch (error) {
//     console.error('Error saving file:', error);
//   }
// };

// const shareFile = async (filePath) => {
//   try {
   
//    Share.open({
//       url: `file://${filePath}`,
//       type: 'text/csv',
//       title: 'Share CSV',
//       message: 'Here is the CSV file you requested',
//     }).catch((result)=> {
//         console.log(result)
//     }).catch((error)=> {
//          console.log(error)
//     })
   
//   } catch (error) {
//     console.error('Error sharing file:', error);
//   }
// };

// const convertJsonToCsv = async (jsonData) => {
//   try {
//     const csvData = jsonToCSV(jsonData);
//     const filePath = await saveCSV(csvData);
//     if (filePath) {
//       await shareFile(filePath);
//     }
//   } catch (error) {
//     console.error('Error converting JSON to CSV or sharing the file:', error);
//   }
// };

// export { convertJsonToCsv }
