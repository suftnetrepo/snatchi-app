import {useState} from 'react';
import {Platform, Alert} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import {PERMISSIONS, request} from 'react-native-permissions';

const useInvoicePDF = ({invoiceTemplate, onSuccess, onError, currencySymbol="£"} = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedPath, setLastGeneratedPath] = useState(null);

  const defaultInvoiceTemplate = invoice => {
    const issueDate = new Date(invoice.issueDate).toLocaleDateString();

    const subtotal = invoice.subtotal;
    const tax = invoice.tax || 0;
    const discount = invoice.discount || 0;
    const total = invoice.totalAmount;

    const invoiceId = invoice._id ? invoice._id.slice(-8).toUpperCase() : 'N/A';

    return `
      <html>
        <head>
          <style>
            body { 
              font-family: 'Helvetica', sans-serif; 
              margin: 0; 
              padding: 20px;
              color: #333;
            }
            .invoice-header { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 20px;
            }
            .invoice-title { 
              font-size: 28px; 
              font-weight: bold; 
              color: #333; 
            }
            .invoice-details { 
              margin-bottom: 20px; 
            }
            .invoice-meta {
              margin-bottom: 30px;
            }
            .invoice-meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .meta-label {
              font-weight: bold;
              color: #555;
            }
            .item-description {
              width: 40%;
            }
            table { 
              width: 100%; 
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th { 
              background-color: #f8f8f8; 
              text-align: left; 
              padding: 12px 10px;
              border-bottom: 2px solid #ddd;
              font-weight: bold;
            }
            td { 
              padding: 12px 10px; 
              border-bottom: 1px solid #eee; 
            }
            .total-section {
              width: 300px;
              margin-left: auto;
              margin-right: 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .total-row.final {
              font-weight: bold;
              font-size: 18px;
              border-bottom: 2px solid #333;
              border-top: 2px solid #333;
              padding: 12px 0;
              margin-top: 10px;
            }
            .amount {
              text-align: right;
            }
            .notes {
              margin-top: 40px;
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
            .notes-title {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .status {
              padding: 6px 12px;
              border-radius: 15px;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 12px;
            }
            .status-unpaid {
              background-color: #ffecec;
              color: #e74c3c;
            }
            .status-paid {
              background-color: #e7f9f1;
              color: #27ae60;
            }
            .status-pending {
              background-color: #ffefd9;
              color: #f39c12;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div>
              <div class="invoice-title">INVOICE</div>
              <div>INV-${invoiceId}</div>
            </div>
            <div>
              <span class="status ${
                invoice.status === 'Paid'
                  ? 'status-paid'
                  : invoice.status === 'Unpaid'
                  ? 'status-unpaid'
                  : 'status-pending'
              }">
                ${invoice.status}
              </span>
            </div>
          </div>
          
          <div class="invoice-meta">
            <div class="invoice-meta-row">
              <div class="meta-label">Issue Date:</div>
              <div>${issueDate}</div>
            </div>
            
            <div class="invoice-meta-row">
              <div class="meta-label">Description:</div>
              <div>${invoice.invoice_description || ''}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th class="item-description">Description</th>
                <th>Hours</th>
                <th>Rate</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  item => `
                <tr>
                <td>${item.date}</td>
                  <td class="item-description">${item.description}</td>
                  <td>${item.hour}</td>
                  <td>${currencySymbol}${item.rate.toFixed(2)}</td>
                  <td class="amount">${currencySymbol}${(item.hour * item.rate).toFixed(2)}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <div>Subtotal</div>
              <div>${currencySymbol}${subtotal.toFixed(2)}</div>
            </div>
            ${
              tax > 0
                ? `
            <div class="total-row">
              <div>Tax</div>
              <div>${currencySymbol}${tax.toFixed(2)}</div>
            </div>
            `
                : ''
            }
            ${
              discount > 0
                ? `
            <div class="total-row">
              <div>Discount</div>
              <div>-${currencySymbol}${discount.toFixed(2)}</div>
            </div>
            `
                : ''
            }
            <div class="total-row final">
              <div>Total</div>
              <div>${currencySymbol}${total.toFixed(2)}</div>
            </div>
          </div>
          
          ${
            invoice.notes
              ? `
          <div class="notes">
            <div class="notes-title">Notes:</div>
            <div>${invoice.notes}</div>
          </div>
          `
              : ''
          }
        </body>
      </html>
    `;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const permission =
        Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

      const result = await request(permission);
      return result === 'granted';
    }
    return true;
  };

  const generatePDF = async invoice => {
    try {
      const templateFn = invoiceTemplate || defaultInvoiceTemplate;
      const html = templateFn(invoice);
      const invoiceId = invoice._id
        ? invoice._id.slice(-6).toUpperCase()
        : 'invoice';

      const options = {
        html,
        fileName: `Invoice-${invoiceId}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      setLastGeneratedPath(file.filePath);
      return file.filePath;
    } catch (error) {
      if (__DEV__) console.error('Failed to generate PDF:', error);
    }
  };

  // Download the PDF
  const downloadInvoice = async invoice => {
    setIsLoading(true);

    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        const error = new Error('Storage permission denied');
        if (onError) onError(error);
        else
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to download the invoice',
          );
        setIsLoading(false);
        return null;
      }

      const filePath = await generatePDF(invoice);
      const invoiceId = invoice._id
        ? invoice._id.slice(-6).toUpperCase()
        : 'invoice';

      if (Platform.OS === 'android') {
        const downloadPath = `${RNFetchBlob.fs.dirs.DownloadDir}/Invoice-${invoiceId}.pdf`;
        await RNFetchBlob.fs.cp(filePath, downloadPath);

        const result = {
          action: 'download',
          path: downloadPath,
          message: `Invoice saved to Downloads folder as Invoice-${invoiceId}.pdf`,
        };

        if (onSuccess) onSuccess(result);
        else Alert.alert('Success', result.message);
        return result;
      } else {
        const result = {
          action: 'download',
          path: filePath,
          message: 'Invoice PDF has been generated',
        };

        if (onSuccess) onSuccess(result);
        else Alert.alert('Success', result.message);

        return result;
      }
    } catch (error) {
      if (onError) onError(error);
      else Alert.alert('Error', 'Failed to download the invoice');
      if (__DEV__) console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Share the PDF
  const shareInvoice = async invoice => {
    setIsLoading(true);

    try {
      const filePath = await generatePDF(invoice);
      const invoiceId = invoice._id
        ? invoice._id.slice(-6).toUpperCase()
        : 'invoice';

      const shareOptions = {
        title: 'Share Invoice',
        message: `Invoice ${invoiceId}`,
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/pdf',
      };

      const result = await Share.open(shareOptions);

      const shareResult = {
        action: 'share',
        path: filePath,
        shareResult: result,
      };

      if (onSuccess) onSuccess(shareResult);
      return shareResult;
    } catch (error) {
      if (error.message !== 'User did not share') {
        if (onError) onError(error);
        else Alert.alert('Error', 'Failed to share the invoice');
        if (__DEV__) console.error(error);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    lastGeneratedPath,
    downloadInvoice,
    shareInvoice,
    generatePDF,
  };
};

export default useInvoicePDF;
