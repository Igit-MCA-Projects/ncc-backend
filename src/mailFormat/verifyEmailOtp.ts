import mjml2html from "mjml";

async function accountVerificationMailTemplate(fullName: string, otp: string) {
  const template = `
    <mjml>
      <mj-head>
        <mj-title>Verify Your Email</mj-title>

        <mj-attributes>
          <mj-all font-family="Arial, Helvetica, sans-serif" />
          <mj-text color="#333333" font-size="16px" />
          <mj-button background-color="#0B5ED7" color="#ffffff" />
        </mj-attributes>
      </mj-head>

      <mj-body background-color="#f4f6f8">

        <mj-section background-color="#0B5ED7" padding="20px">
          <mj-column>
            <mj-text
              align="center"
              color="#ffffff"
              font-size="28px"
              font-weight="bold"
            >
              IGIT NCC
            </mj-text>

            <mj-text
              align="center"
              color="#ffffff"
              font-size="16px"
            >
              Account Verification
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="30px">
          <mj-column>

            <mj-text font-size="20px" font-weight="bold">
              Hello ${fullName},
            </mj-text>

            <mj-text>
              Thank you for registering with <strong>IGIT NCC</strong>.
              To complete your registration, please verify your email address
              using the One-Time Password (OTP) below.
            </mj-text>

            <mj-text
              align="center"
              font-size="34px"
              font-weight="bold"
              color="#0B5ED7"
              padding="25px 0"
            >
              ${otp}
            </mj-text>

            <mj-text align="center" color="#666666">
              This OTP is valid for <strong>10 minutes</strong>.
            </mj-text>

            <mj-divider border-width="1px" border-color="#dddddd" />

            <mj-text font-size="14px" color="#777777">
              If you did not create an account with IGIT NCC, you can safely
              ignore this email. Do not share this OTP with anyone.
            </mj-text>

          </mj-column>
        </mj-section>

        <mj-section background-color="#f4f6f8">
          <mj-column>

            <mj-text
              align="center"
              font-size="13px"
              color="#888888"
            >
              © ${new Date().getFullYear()} IGIT NCC
            </mj-text>

            <mj-text
              align="center"
              font-size="13px"
              color="#888888"
            >
              This is an automated email. Please do not reply.
            </mj-text>

          </mj-column>
        </mj-section>

      </mj-body>
    </mjml>
  `;

  const { html } = await mjml2html(template);

  return html;
}

export { accountVerificationMailTemplate };
