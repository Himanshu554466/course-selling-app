Summary of Comments in Code for create course (Hinglish Notes):

Model Import: Database ke saath kaam karne ke liye Course model ko import kiya.
Request Handling: req.body se client ka data extract karte hain aur use validate karte hain.
Validation: Sabhi fields hone chahiye (title, description, price, image). Agar na ho, toh error bhejte hain.
Data Preparation: Naya course create karne ke liye ek object (courseData) banate hain.
Database Save: Course.create() ka use karke course ko database mein save karte hain.
Success Response: Course create hone ke baad client ko success message aur data bhejte hain.
Error Handling: Agar koi error aaye, toh usse catch karke client ko 500 error response bhejte hain aur debugging ke liye console pe error print karte hain.

##
for uploading the file(image) we use express-fileupload package.
image is not directly store in database for that we first upload the image on cloudunary
(it,s cloud database where we store our image on that cloud and then we get url.)
for generating the url in the form of string for the image that we uploaded we use cloudinary.
For that first we need to install cloudinary in our package.json by using npm i ___ and we write the code for settup in index file,then we store the api key of cloudinary in our .env file.
##


FOR COURSE UPDATION
we update our course by using id in database

F