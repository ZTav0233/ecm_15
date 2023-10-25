// @2017/11/23
* Product: Dynamsoft Web TWAIN SDK v13
* Summary: this Readme.txt is to help you understand the files under the Resources folder

====== Dynamsoft Service Update Packages ======

- WinDSUpdate_13.3.0.0115.zip
- MacDSUpdate_13.3.0.0115.zip
- LinuxDSUpdate_13.3.0.0115.zip
These files are used to update the Dynamsoft Service. The update is not enabled by default but can be configured to be automated.

====== Dynamsoft JavaScript files ======

- dynamsoft.webtwain.config.js
This file is used to make basic configuration of Dynamic Web TWAIN. It's where you enter the product key for the product and to change the initial viewer size, etc.

- dynamsoft.webtwain.initiate.js
This file is the core of the Dynamic Web TWAIN JavaScript Library. You're not supposed to change it without consulting the Dynamsoft Support Team.

- dynamsoft.webtwain.install.js
This file is used to configure the dialogs which are shown when Dynamic Web TWAIN is not installed or needs to be upgraded. This file is already referenced inside the dynamsoft.webtwain.initiate.js

====== End-user Distribution files ======

* for Windows end users who use IE 10/11, Chrome or Firefox

- DynamsoftServiceSetup.exe, or MSI/DynamsoftServiceSetup.msi: 
This Dynamsoft Service needs to be manually installed on end-user machine. You can use the MSI to silently deploy the service to all end-user machines, refer to: https://developer.dynamsoft.com/dwt/kb/2866

- WinDWT_*.*.*.*.zip:
this ZIP file contains the core scanning library. Please keep it in the Resources folder on your HTTP server. The file will be automatically and silently deployed to the end-user machine once the Dynamsoft Service is installed.

* for Windows end users who use IE 6/7/8/9

- DynamicWebTWAINActiveX.exe:
- MSI/WebTwainMSITrialX64.msi and WebTwainMSITrialX86.msi:
- DynamicWebTWAIN.cab and DynamicWebTWAINx64.cab:
You can choose one of the above installer type to install the ActiveX. The default option is the EXE. If you prefer to use CAB, you can change the setting in the dynamsoft.webtwain.config.js
You can use the MSI to silently deploy the service to all end-user machines, refer to: https://developer.dynamsoft.com/dwt/kb/2866

* for macOS end users who use Safari, Chrome or Firefox

- DynamsoftServiceSetup.pkg: 
This Dynamsoft Service needs to be manually installed on end-user machine.

- MacDWT_*.*.*.*.zip:
this ZIP file contains the core scanning library. Please keep it in the Resources folder on your HTTP server. The file will be automatically and silently deployed to the end-user machine once the Dynamsoft Service is installed.

* for Linux end users who use Chrome or Firefox

- DynamsoftServiceSetup.deb or DynamsoftServiceSetup.rpm: 
This Dynamsoft Service needs to be manually installed on Debian/Ubuntu or Fedora end-user machine.

-LinuxDWT_*.*.*.*.zip: 
this ZIP file contains the core scanning library. Please keep it in the Resources folder on your HTTP server. The file will be automatically and silently deployed to the end-user machine once the Dynamsoft Service is installed.

=== Add-on related files ===

-addon/dynamsoft.webtwain.addon.pdf.js
This file is the core of the PDF Rasterizer addon. You're not supposed to change it without consulting the Dynamsoft Support Team.

-addon/Pdf.zip 
-addon/Pdfx64.zip 
-addon/MacPdf.zip 
-addon/LinuxPdf.zip
These files are for installing the PDF Rasterizer addon on your Windows system (32bit or 64bit) or Mac or Linux. 


===== Other optional files =====

- DynamicWebTWAINPlugIn.msi
This file is for installing Dynamic Web TWAIN Plugin edition for Windows end users to use Chrome v27- or Firefox v27-

- DynamicWebTWAINMacEdition.pkg
This file is for installing Dynamic Web TWAIN Plugin edition for macOS end users to use Safari v7-, Chrome v27- or Firefox v27-

- dynamsoft.webtwain.intellisense.js
- dynamsoft.webtwain.intellisense.nonvs.js
These two files are used to add intellisense in your IDE to make it easier to use the Dynamic Web TWAIN JavaScript Library in your project.

- addon/dynamsoft.webtwain.addon.pdf.intellisense.js
- addon/dynamsoft.webtwain.addon.pdf.intellisense.nonvs.js
These two files are used to add intellisense in your IDE to make it easier to use the PDF Rasterizer addon in your project.
