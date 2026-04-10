Your task is to build a desktop app that can run locally on a mac to build software architecture diagrams.
Think of an app similar to draw.io or paperdraw.
The user should be able to edit the architecture diagrams for Azure/AWS.
Use the official icons provided by Azure/AWS.
The app should be flexible enough to edit the logos, new cloud services, etc.
Any other common needs such as arrows, lines, bounding boxes, labels, etc. 
Add options to export as pdf and/or png.
Note:
1. Export should only contain the content not the whole app.
2. The user should be able to link the components using the lines.
3. The user should be able to change the arrow direction.
4. Add option to add basic components such as rectangle, dotted lines and other common shapes.
5. Any of the components, logos etc can be layered using options such as Send Back, Send Backward, Bring to Front, Bring Forward.
6. Add option to adjust the Font Size and text wrap option for all label in icon properties.
7. Bug fixes
    - The backward direction and both direction in the edge properties are not working properly.
    - The png and export is not clear enough. Consider HD output is required.
    - Group option does not seem to do anything.
    - Show the shapes in a dropdown instead of showing them separately. Also display shape names along with the icon.
    - Edge properties for directions Backward and None are incorrect. Selecting Backward shows arrows in the both directions. Selecting None shows arrows in both directions when it should not have any. 
8. Provide option to the user to select the path alone. Use '/Users/rvenkat/Downloads/Icon-package_01302026.31b40d126ed27079b708594940ad577a86150582/Resource-Icons_01302026/Res_Containers' as the default path for the custom icons. Do not expect the user to provide a manifest file. Generate/Regenerate any necessary files as part of loading the svg files among all other files in the selected folder.