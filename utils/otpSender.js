exports.otpSender = (user, URI) => {
    return (
       `<html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Lato:ital@0;1&family=Mooli&display=swap');
            /* Define your CSS styles here */
            body {
              background-color: #f2f2f2;
              font-family: 'Lato', sans-serif;
              display:flex;
              align-items: center;
              justify-content: center;
            }
            h1 {
              color: #333;

            }
            p {
              font-size: 16px;
              line-height: 1.5;
              margin-bottom: 20px;
            }
            img{
              border-radius: 20px;
              width:4em;
              height: 4em;
            }
            a{
              background-color: #7FE9F8;
              text-decoration: none;
              border-radius: 3px;
              box-shadow: 2px 10px 10px ;
              color: #8dddf0;
              margin-left: 10px;
            }
            span{
              color:black;
            }
            #boxModel{
              width:fit-content;
              height:fit-content;
              background-color: #cff6ff;
              border-radius: 15px;
              padding:10px;
            }
          </style>
          <meta charset="UTF-8">
        </head>
        <body>
          <div id="boxModel">
         <img src="https://i.ibb.co/VvjDSDt/Group-11.png" alt="Group-11">
          <h2>Hello ${user.name}!!</h2>
          <p>
            OTP request
          </p>
          <p>OTP for your account is : ${URI}</p>
          <p><em>If you did not initiate this request,please ignore this message.<em></p>  
          <p><em>Have a great day! :)<em></p>
            </div>
        </body>
      </html>`
    )
}
