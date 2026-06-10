package email

import (
	"bytes"
	"text/template"
)

var VerificationEmailTemplate = `<!DOCTYPE html>
<html>
    <body>
        <p>Hi {{.TeamName}},</p>
		<p>You can verify your Vinci account via the link: <a href='{{.Link}}'>{{.Link}}</a></p>
		<p>Good luck!</p>
		<p>For any questions related to the contest, you can reach us at info@robovinci.xyz! Please follow @icfpcontest2022 Twitter account and our announcements at icfpcontest2022.github.io</p>
    </body>
</html>`

var RenewPasswordEmailTemplate = `<!DOCTYPE html>
<html>
    <body>
        <p>Hi {{.TeamName}},</p>
		<p>You can renew password of your Vinci account via the link: <a href='{{.Link}}'>{{.Link}}</a></p>
		<p>For any questions related to the contest, you can reach us at info@robovinci.xyz! Please follow @icfpcontest2022 Twitter account and our announcements at icfpcontest2022.github.io</p>
    </body>
</html>`

type TemplateValues struct {
	TeamName string
	Link     string
}

func RenderVerificationEmailTemplate(v TemplateValues) string {
	var t = template.Must(template.New("Verification").Parse(VerificationEmailTemplate))
	var b bytes.Buffer
	t.Execute(&b, v)

	return b.String()
}

func RenderRenewPasswordEmailTemplate(v TemplateValues) string {
	var t = template.Must(template.New("RenewPassword").Parse(RenewPasswordEmailTemplate))
	var b bytes.Buffer
	t.Execute(&b, v)

	return b.String()
}
