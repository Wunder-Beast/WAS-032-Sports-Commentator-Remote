/** biome-ignore-all lint/a11y/useValidAnchor: external content */
/** biome-ignore-all lint/performance/noImgElement: external content */
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PrivacyModal({
	active,
	closeButton,
}: {
	active: boolean;
	closeButton: () => void;
}) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	if (!mounted) return null;

	const modalContent = (
		<div
			className={`att ${active ? "top-0" : "top-full"} fixed right-0 bottom-0 left-0 z-[9999] flex flex-col overflow-y-auto bg-white text-neutral-900 transition-all duration-500`}
		>
			<div className="flex justify-end">
				<button
					type="button"
					className="mt-3 mr-5 rounded-full bg-att-blue p-1"
					onMouseDown={() => {
						closeButton();
					}}
				>
					<XIcon className="h-6 w-6 rounded-full text-white" strokeWidth={3} />
				</button>
			</div>
			<div className="privacy-content relative flex flex-grow flex-col px-5 pt-1 pb-5">
				<h1>AT&amp;T Privacy Notice</h1>
				<p>
					Thank you for reading our Privacy Notice. Your privacy is important to
					you and to us. This notice explains how we use your information and
					keep it safe.{" "}
				</p>
				<p>
					Importantly, it explains the choices you can make at any time about
					how your information may be used.
				</p>
				<p>
					This notice applies to AT&amp;T products and services including
					internet, wireless, voice and AT&amp;T apps. We will tell you if a
					different notice applies. For example:
				</p>
				<ul>
					<li>
						Cricket and DIRECTV (including U-verse TV) have their own privacy
						notices.
					</li>
					<li>
						AT&amp;T business customers may have a service agreement that covers
						the handling of information. The service agreement controls if it is
						different from this Privacy Notice.
					</li>
					<li>
						For AT&amp;T business customers outside the United States,{" "}
						<a href="/privacy/global_approach/biz-notice-mow.html">
							the AT&amp;T Business Customer Privacy Notice - Most of World
						</a>{" "}
						governs if different from this Privacy Notice.
					</li>
				</ul>
				<p>
					Please make sure everyone who uses your account knows they are covered
					by this notice.
				</p>
				<h3>The information we collect</h3>
				<p>
					To better run our business, we collect information about you, your
					equipment and how you use our products and services. This can include:
				</p>
				<ul>
					<li>
						<strong>Account information.</strong> You give us information about
						yourself, such as contact and billing information. We also keep
						service-related history and details, including{" "}
						<a href="https://www.att.com/consent/cpni/">
							Customer Proprietary Network Information
						</a>
						.
					</li>
					<li>
						<strong>Equipment information.</strong> We collect information about
						equipment on our network like the type of device you use, device ID,
						and phone number.
					</li>
					<li>
						<strong>Network performance.</strong> We monitor and test the health
						and performance of our network. This includes your use of Products
						and Services to show how our network and your device are working.
					</li>
					<li>
						<strong>Location information.</strong> Location data is
						automatically generated when devices, products and services interact
						with cell towers and Wi-Fi routers. Location can also be generated
						by Bluetooth services, network devices and other tech, including GPS
						satellites.
					</li>
					<li>
						<strong>Web browsing and app information</strong>. We automatically
						collect a variety of information which may include time spent on
						websites or apps, website and IP addresses and advertising IDs. It
						also can include links and ads seen, videos watched, search terms
						entered and items placed in online AT&amp;T shopping carts. We may
						use pixels, cookies and similar tools to collect this information.
						We don't decrypt information from secure websites or apps - such as
						passwords or banking information.
					</li>
					<li>
						<strong>Biometric information.</strong> Fingerprints, voice prints
						and face scans are examples of biological characteristics that may
						be used to identify individuals. Learn more in our{" "}
						<a href="/privacy/privacy-notice/biometrics.html">
							Biometric Information Privacy Notice
						</a>
						.
					</li>
					<li>
						<strong>Third-party information.</strong> We get information from
						outside sources like credit reports, marketing mailing lists and
						commercially available demographic and geographic data. Social media
						posts also may be collected, if you reach out to us directly or
						mention AT&amp;T. Sometimes this data is de-identified, aggregated,
						or anonymized.
					</li>
				</ul>
				<p>
					All these types of information are considered Personal Information
					when they can reasonably be linked to you as an identifiable person or
					household. For instance, information is personal when it can be linked
					to your name, account number or device.
				</p>
				<h3>How we use your information</h3>
				<p>
					We rely on the information we collect to support our business
					functions, power our services and improve your experience, such as
					when we:
				</p>
				<ul>
					<li>
						Combine it with the information from testing and running our network
						to determine which products and services better meet the needs of
						our customers.
					</li>
					<li>Provide our products and services.</li>
					<li>Contact you.</li>
					<li>
						Improve your experience and safety. This includes verifying your
						identity, detecting and preventing fraud, protecting your financial
						accounts, authorizing transactions and assisting your interactions
						with customer care.
					</li>
					<li>Improve and protect our network.</li>
					<li>
						Use it to help understand which additional products and services may
						interest you and others. (We don't access or use the content of your
						texts, emails or calls for this or any other marketing and
						advertising.)
					</li>
					<li>
						Design and deliver advertising, marketing and promotional campaigns
						to you and others - and measuring their effectiveness (
						<a href="https://www.att.com/acctmgmt/passthrough/PRIVACYCHOICES?origination_point=PrivacyCenter">
							See your choices
						</a>
						).
					</li>
					<li>
						Use it for billing, collection, and protection of our property and
						legal rights.
					</li>
					<li>
						Prevent and investigate security issues, illegal activities, and
						violations of our terms and conditions.
					</li>
					<li>
						De-identify, aggregate, or anonymize it to protect your privacy and
						security. We don't try to re-identify this data like attempting to
						associate it with an individual person except to evaluate the
						effectiveness of our de-identification policies and procedures.
					</li>
					<li>
						Conduct research and create aggregated reports - reports that offer
						insights about groups of customers, but not individuals (we do not
						attempt to re-identify individuals in aggregated reports).
					</li>
				</ul>
				<h3>How we share your information</h3>
				<p>
					As described in the following paragraphs, AT&amp;T shares information
					within our own AT&amp;T companies and affiliates. We also share with
					non-AT&amp;T companies.
				</p>
				<p>
					<strong>AT&amp;T affiliates.</strong> We share information that
					identifies you personally with our <a href="#">affiliates</a>, such as
					DIRECTV and Cricket. When we share this information, they must follow
					this Privacy Notice regarding your info, not just their own policy.
					This includes the{" "}
					<a href="https://www.att.com/acctmgmt/passthrough/PRIVACYCHOICES?origination_point=PrivacyCenter">
						privacy choices
					</a>{" "}
					you make with AT&amp;T.
				</p>
				<p>
					<strong>
						AT&amp;T affiliates and non-AT&amp;T companies for advertising and
						marketing.
					</strong>{" "}
					We may share information with affiliates and other companies to
					deliver our ads and marketing or to assess their effectiveness. (Learn
					more about our ad programs and see{" "}
					<a href="https://www.att.com/acctmgmt/passthrough/PRIVACYCHOICES?origination_point=PrivacyCenter">
						your choices
					</a>
					.)
				</p>
				<p>
					<strong>Non-AT&amp;T companies providing a service.</strong> We use
					suppliers for services like marketing and mailing bills. When we share
					your information with suppliers, we require them to use it only for
					the intended purpose and to protect it consistent with this notice.
				</p>
				<p>
					<strong>Non-AT&amp;T companies for identity verification.</strong> We
					share your information to protect you from fraud, authenticate your
					identity, protect your financial accounts and authorize transactions.
					When we share with companies like your bank for this purpose, we
					require them to use it only for the intended purpose and to protect it
					consistent with this notice. (Learn more and{" "}
					<a href="https://www.att.com/acctmgmt/passthrough/PRIVACYCHOICES?origination_point=PrivacyCenter">
						see your choices
					</a>
					, including your right to decline this service.)
				</p>
				<p>
					<strong>
						Non-AT&amp;T companies or entities where authorized or required by
						law.
					</strong>{" "}
					This can happen when we:
				</p>
				<ul>
					<li>
						Comply with court orders, subpoenas, and lawful discovery requests,
						and as otherwise authorized or required by law. Like all companies,
						we must comply with legal requirements. You can learn more in our{" "}
						<a href="/privacy/transparencyreport.html">Transparency Report</a>.
					</li>
					<li>Detect and prevent fraud.</li>
					<li>
						Provide or obtain information related to payment for your service.
					</li>
					<li>
						Route your calls or other communications, like connecting calls or
						text messages with other carrier networks.
					</li>
					<li>
						Ensure network operations and security, defend against legal claims
						and enforce our legal rights.
					</li>
					<li>
						Notify, respond, or provide information (including location) to an
						appropriate governmental entity in emergency circumstances such as
						immediate danger of death or serious physical injury.
					</li>
					<li>
						Alert the National Center for Missing and Exploited Children to
						information concerning child pornography if we become aware through
						the provision of our services.
					</li>
					<li>
						Share the names, addresses and telephone numbers of non-mobile phone
						customers with phone directory publishers and directory assistance
						services as required by law. We honor your request for non-published
						or non-listed numbers.
					</li>
					<li>
						Provide name and phone number for wireline and wireless Caller ID
						and related services like Call Trace.
					</li>
				</ul>
				<p>
					<strong>
						Non-AT&amp;T companies for metrics, insights and research.
					</strong>{" "}
					We may share aggregated (grouped) data that does not identify you
					personally for these purposes. We require that companies and entities
					agree not to attempt to identify individuals - or allow others to do
					so. We share in this manner for:
				</p>
				<ul>
					<li>
						<strong>Metrics:</strong> Sometimes you enjoy a service from us that
						directly involves another business. For instance, we might provide
						the Wi-Fi service at a place you visit. As part of our service, we
						may provide aggregate metrics reports to that business about how the
						Wi-Fi is being used, such as aggregated location and web-browsing
						data. It can only be used for group insights.
					</li>
					<li>
						<strong>Insights:</strong> We may share aggregated data about our
						network, operations or services.
					</li>
					<li>
						<strong>Research:</strong> We may share information for research. We
						require the entities to handle the data securely and not reuse or
						resell it.
					</li>
				</ul>
				<p>
					<strong>Non-AT&amp;T companies for location services.</strong> With
					your consent, we may share your location information for traffic and
					mapping apps and other location services to which you subscribe. We
					share only with your consent unless required by law. Keep in mind:
				</p>
				<ul>
					<li>
						You may give your consent to us, or you may give it directly to
						another company - like a medical alerting device company.
					</li>
					<li>
						If you give it directly to another company, that company governs the
						use or disclosure of location.
					</li>
					<li>
						In some cases, such as parental controls, consent may come from the
						AT&amp;T account holder and not the individual user.
					</li>
				</ul>
				<h3>Your privacy choices and controls</h3>
				<p>
					You can manage how we use and share your information for certain
					activities including advertising and marketing. Here are key examples:
				</p>
				<p>
					<strong>Do not sell or share my personal information.</strong> We may
					share limited information to create, deliver, and measure
					advertisements for things you might like. This includes targeted
					advertising, which may be based on personal data obtained from your
					interactions with other businesses. We also share information in ways
					that may be considered a sale of information under some state laws,
					such as exchanging subscriber lists for marketing.
				</p>
				<p>You can ask us to stop at any time, just:</p>
				<ul>
					<li>
						Visit{" "}
						<a href="https://www.att.com/acctmgmt/passthrough/PRIVACYCHOICES?origination_point=PrivacyCenter">
							att.com/PrivacyChoices
						</a>{" "}
						or our{" "}
						<a href="/privacy/choices-and-controls.html">
							Choices and Controls page
						</a>{" "}
						and select "Do not sell or share my personal information."
					</li>
					<li>
						Contact us at (866) 385-3193 if you are a California resident.
					</li>
				</ul>
				<p>
					We recognize and honor the preference signal associated with a{" "}
					<a href="http://www.globalprivacycontrol.org/">
						Global Privacy Control
					</a>
					.
				</p>
				<p>
					<strong>Access, delete and correct your personal information.</strong>{" "}
					You can ask to see what personal information we have about you. You
					can also ask us to delete or correct it.
				</p>
				<ul>
					<li>
						<strong>Access and Portability.</strong> If you want to see the
						personal information we've collected, you can ask us for it. We will
						describe the categories of info we collect, the specific pieces
						we've collected, the sources of the information, the purposes for
						collecting, sharing or selling it and the categories of non-AT&amp;T
						companies with whom we shared it. You can also ask to "port" your
						data, which means you get a copy that you can take with you.
					</li>
					<li>
						<strong>Delete.</strong> You can ask us to delete your personal
						information. In keeping with various state laws, please know that we
						will still keep data needed for things like running the business,
						security and fraud protection, compliance with legal obligations and
						marketing our products and services to our own customers.
					</li>
					<li>
						<strong>Correct.</strong> You can ask us to correct inaccurate
						personal information we have about you. We'll ask you to provide
						documentation to support the correction and let you know the result.
					</li>
				</ul>
				<p>
					To access, delete or correct your information, visit our{" "}
					<a href="/privacy/choices-and-controls.html">
						Choices and Controls page
					</a>
					. California residents can also contact us at (866) 385-3193. Helpful
					details about the process can be found at{" "}
					<a href="https://www.att.com/mydatarequest/">
						our Data Request Center
					</a>
					, including your option to appeal.
				</p>
				<p>
					We don't mind if you make access, deletion or correction requests, or
					ask us not to sell or share information. These are rights under
					certain state laws, and we have extended their availability to others
					across the U.S., regardless of where you live.{" "}
				</p>
				<p>
					As required by California law, you can review information specifically
					about California requests from the previous calendar year on our{" "}
					<a href="/privacy/StateLawApproach/california/ca-metrics.html">
						California metrics page
					</a>
					. We also follow state requirements within California regarding{" "}
					<a href="/privacy/StateLawApproach/california/ca-biz-customers.html">
						businesses
					</a>{" "}
					and{" "}
					<a href="/privacy/StateLawApproach/california/ca-workers.html">
						those that provide work for us.
					</a>
				</p>
				<h4>Personalized and Personalized Plus</h4>
				<p>
					AT&amp;T has two programs that use your personal information to help
					customize your experience. For instance, you might be shown an online
					advertisement that is more relevant to your interests, rather than a
					general ad.
				</p>
				<p>
					You can choose to participate or not - and it's never a problem if you
					change your mind. You are automatically enrolled in the Personalized
					program, but you can always opt out. You must opt in to join
					Personalized Plus. Choices for both programs can be made at{" "}
					<a href="https://att.com/PrivacyChoices">att.com/PrivacyChoices</a>.
				</p>
				<p>Here is a comparison of the programs:</p>
				<table>
					<thead>
						<tr>
							<th rowSpan={1} colSpan={1}>
								<p>Data Use or Sharing Description</p>
							</th>
							<th rowSpan={1} colSpan={1}>
								<p>
									<strong>Personalized</strong>
								</p>
							</th>
							<th rowSpan={1} colSpan={1}>
								<p>
									<strong>Personalized Plus</strong>
								</p>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<p>
									Uses data about your use of our products and services,
									including data from apps.
								</p>
							</td>
							<td>
								<p>✔</p>
							</td>
							<td>
								<p>✔</p>
							</td>
						</tr>
						<tr>
							<td>
								<p>
									Uses demographic data like age range and ethnicity* that we
									purchase from third parties.
								</p>
							</td>
							<td>
								<p>✔</p>
							</td>
							<td>
								<p>✔</p>
							</td>
						</tr>
						<tr>
							<td>
								<p>Uses data from our advertising partners.</p>
							</td>
							<td>
								<p>✔</p>
							</td>
							<td>
								<p>✔</p>
							</td>
						</tr>
						<tr>
							<td>
								<p>
									Uses automated decision-making, such as artificial
									intelligence.
								</p>
							</td>
							<td>
								<p>✔</p>
							</td>
							<td>
								<p>✔</p>
							</td>
						</tr>
						<tr>
							<td>
								<p>
									Does <strong>not</strong> use information about your medical
									conditions or financial account information.
								</p>
							</td>
							<td>
								<p>✔</p>
							</td>
							<td>
								<p>✔</p>
							</td>
						</tr>
						<tr>
							<td>
								<p>
									Does <strong>not</strong> access or use the contents of your
									texts, emails or calls.
								</p>
							</td>
							<td>
								<p>✔</p>
							</td>
							<td>
								<p>✔</p>
							</td>
						</tr>
						<tr>
							<td>
								<p>
									May share data with other companies involved in advertising.
								</p>
							</td>
							<td />
							<td>
								<p>✔</p>
							</td>
						</tr>
						<tr>
							<td>
								<p>
									May use precise location and Customer Proprietary Network
									Information for marketing and advertising.
								</p>
							</td>
							<td />
							<td>
								<p>✔</p>
							</td>
						</tr>
						<tr>
							<td>
								<p>
									May use web browsing we collect as your internet provider for
									marketing and advertising and infer websites you visit over a
									secured connection.
								</p>
							</td>
							<td />
							<td>
								<p>✔</p>
							</td>
						</tr>
					</tbody>
				</table>
				<p>
					*If you live in certain states, we won't collect, use, store or share
					your sensitive personal information for marketing and advertising
					unless you join Personalized Plus. This includes information like
					ethnicity and racial origin. The states are Colorado, Connecticut,
					Delaware, Indiana, Iowa, Montana, Oregon, Tennessee, Texas, Utah and
					Virginia.
				</p>
				<p>
					If you join the Personalized Plus program, it is an extension of the
					Personalized program, and you will be enrolled in both. If you also
					select a privacy option called "Do not sell or share my personal
					information," you will be enrolled only in portions of Personalized
					Plus that don't sell or share your information externally.
				</p>
				<h4>More choices and controls</h4>
				<p>
					<strong>Customer Proprietary Network Information (CPNI). </strong>
					CPNI is information related to the telecommunications services you
					purchase from us, such as which subscription plan you have and details
					about who you called. Your phone number, name and address are not
					CPNI. It is your right and our duty under federal law to protect the
					confidentiality of your CPNI.
				</p>
				<p>
					You can choose whether we use your CPNI internally for marketing -
					such as helping to offer you new services and promotions.{" "}
				</p>
				<p>
					You can opt out at{" "}
					<a href="https://att.com/cpni/optout">att.com/cpni/optout</a>. You can
					also call us any time at (800) 315-8303 and follow the prompts. Or you
					can talk to a service representative at (800) 288-2020 (consumer) or
					(800) 321-2000 (business).
				</p>
				<p>
					We don't share CPNI outside of our AT&amp;T affiliates, agents and
					suppliers without your consent except for court orders, fraud
					detection, providing service, network operations and security,
					aggregate (grouped) information that doesn't identify you personally
					and as otherwise authorized by law.
				</p>
				<p>
					If you choose to restrict our use of CPNI, it won't affect your
					services. We keep your choice until you change your mind, which you
					can do at any time. Keep in mind, even if you restrict use of your
					CPNI, you may still get marketing from us.
				</p>
				<p>
					<strong>Identify verification.</strong> Non-AT&amp;T companies like
					your bank may receive limited information from us to help protect your
					accounts from fraud, verify your identity and make sure it's really
					you authorizing a transaction. We do not allow these non-AT&amp;T
					companies to use your information for any purpose except those
					services. You are generally enrolled through the non-AT&amp;T company,
					but you can stop at any time through us. Text "STOP" to 8010 to turn
					off Identity Verification, or text "RESUME" to restart. Or manage your
					choices at{" "}
					<a href="https://www.att.com/acctmgmt/passthrough/PRIVACYCHOICES?origination_point=PrivacyCenter">
						att.com/PrivacyChoices
					</a>
					.
				</p>
				<p>
					<strong>Contact preferences.</strong> We like to tell you about offers
					and programs that may interest you. You can manage how we do that.
					Keep in mind that we still may need to contact you with service and
					non-marketing messages. Please visit{" "}
					<a href="/privacy/privacy-notice/contact-preferences.html">
						Contact Preferences
					</a>{" "}
					for more information and links.
				</p>
				<h2>Industry choices and controls</h2>
				<p>
					<strong>Online behavioral advertising.</strong> You have industry-wide
					choices about online, interest-based advertising.
				</p>
				<p>
					Companies including AT&amp;T may use cookies, mobile advertising
					identifiers, and other technologies to collect information about your
					use of websites including ours. This information can be used to
					analyze and track online activity or deliver ads and content tailored
					to your interests.
				</p>
				<p>
					You can opt out of online behavioral advertising from companies that
					participate in the{" "}
					<a href="http://www.aboutads.info/">Digital Advertising Alliance</a>.
					Go to their{" "}
					<a href="http://www.aboutads.info/choices/#completed">
						Consumer Choice Page
					</a>
					. You can also select this icon{" "}
					<img
						src="https://about.att.com/ecms/dam/csr/privacy-redesign/ad_info_icon.gif"
						alt="ad_info_icon"
					/>{" "}
					when you see it on an online ad.
				</p>
				<ul>
					<li>
						You can limit collection of data on websites by{" "}
						<a href="#">managing cookies and similar technologies</a> on your
						computer. Remember that if you change computers, devices, or web
						browsers, or if you delete cookies, you will need to manage them
						again.
					</li>
				</ul>
				<p>
					At AT&amp;T, please note that when we collect web browsing information
					as an internet service provider, it works independently of your web
					browser's cookie and private browsing settings that interact with
					online behavioral advertising. You can manage AT&amp;T's use of web
					browsing information - such as our Personalized Plus program - at{" "}
					<a href="https://att.com/PrivacyChoices">att.com/PrivacyChoices</a>.
				</p>
				<p>
					We don't currently respond to Do Not Track. Please go to{" "}
					<a href="http://www.allaboutdnt.com/">All About Do Not Track</a> for
					more information.
				</p>
				<p>
					Unless you join our Personalized Plus ad program, we don't knowingly
					allow non-AT&amp;T companies to collect your personally identifiable
					activity on our websites for their own use and tracking.
				</p>
				<h3>Data retention and security</h3>
				<p>
					We keep your information as long as we need it for business, tax or
					legal purposes. We set our retention periods based on things like what
					type of personal information it is, how long it's needed to operate
					the business or provide our products and services, and whether it's
					subject to contractual or legal obligations. These obligations might
					be ongoing litigation, mandatory data retention laws or government
					orders to preserve data for an investigation. After that, we destroy
					it by making it unreadable or indecipherable.
				</p>
				<p>
					We work hard to safeguard your information using technology controls
					and organizational controls. We protect our computer storage and
					network equipment. We require employees to authenticate themselves to
					access sensitive data. We limit access to personal information to the
					people who need access for their jobs. And we require callers and
					online users to authenticate themselves before we provide account
					information.
				</p>
				<p>
					No security measures are perfect. We can't guarantee that your
					information will never be disclosed in a manner inconsistent with this
					notice. If a breach occurs, we'll notify you as required by law.
				</p>
				<h2>Other privacy information</h2>
				<h3>Information that we collect and share - in chart format</h3>
				<p>
					<a href="/privacy/privacy-notice/state-disclosures.html#we-collect">
						This chart
					</a>{" "}
					shows the personal information that we collect, along with the purpose
					for its collection.
				</p>
				<p>
					<a href="/privacy/privacy-notice/state-disclosures.html#about-consumers">
						This chart
					</a>{" "}
					shows the personal information we shared or sold over the past year
					about at least some consumers. It also shows the purpose for which we
					shared or sold it. Some states define "sale" very broadly.
				</p>
				<p>
					<a href="/privacy/privacy-notice/state-disclosures.html#sensitive-personal-info">
						This chart
					</a>{" "}
					shows the sensitive personal information we've collected about
					consumers over the past year, including the purpose for its
					collection, sharing and sale.
				</p>
				<h3>Changes in ownership or to the notice</h3>
				<p>
					Information about you may be shared or transferred if AT&amp;T is part
					of a merger, acquisition, sale of company assets or transition of
					service to another provider. Information could also be shared in the
					unlikely event that our business became insolvent, bankrupt or put
					into receivership.
				</p>
				<p>
					We update this Privacy Notice as necessary to reflect business changes
					and satisfy legal requirements. We post a prominent notice on our
					websites of any material changes. We give you reasonable notice before
					any material changes take effect.
				</p>
				<h3>Information specific to business customers</h3>
				<p>
					We don't use our business customers' user information for marketing or
					advertising, except to market business products and services,
					including apps and devices. However, we may use our relationship with
					you to qualify you for certain deals on consumer products and
					services. You can call the toll-free number on your bill to see
					whether your current products and services are billed as business or
					consumer.
				</p>
				<h3>Information specific to children</h3>
				<p>
					We don't knowingly collect personal information from anyone under 13
					without parental notice, and we get parental consent where
					appropriate. We also won't contact a child under 13 for marketing
					purposes without parental consent. However, if we are not aware that a
					child is using a service or device purchased by an adult, we may
					collect the information and treat it as the adult's. (See{" "}
					<a href="https://www.att.com/acctmgmt/passthrough/PRIVACYCHOICES?origination_point=PrivacyCenter">
						your privacy choices
					</a>
					.)
				</p>
				<p>
					We don't have knowledge that we sell the personal information of
					anyone under 16. If we collect personal information that we know is
					from anyone under 16, we won't sell it unless we receive affirmative
					permission to do so. If a child is under 16 and at least 13, the child
					may provide the permission.
				</p>
				<h3>How to contact us about this notice</h3>
				<p>
					You can{" "}
					<a href="https://www.att.com/mydatarequest/att/submit-inquiry-nocaseid/">
						contact us with questions
					</a>{" "}
					about this notice. You can also write us at AT&amp;T Privacy Notice,
					Chief Privacy Office, 208 S. Akard, Room 2901, Dallas, TX, 75202.
				</p>
				<p>
					If you have questions not related to privacy, click on the "Contact
					Us" link on the bottom of any att.com page.
				</p>
				<p>
					You can access your online account from the upper right-hand corner of
					our home page at att.com.
				</p>
				<p>
					If you're not satisfied with our resolution of any dispute, including
					privacy and personal information concerns, you can learn about our
					dispute resolution procedures on our{" "}
					<a href="https://www.att.com/help/notice-of-dispute/">
						dispute resolution page
					</a>
					.
				</p>
				<p>
					You also have the option to file a complaint with the FTC Bureau of
					Consumer Protection using an{" "}
					<a href="https://reportfraud.ftc.gov/#/">online form</a> or calling
					toll-free to 877.FTC.HELP ((877) 382.4357; TTY: (866) 653.4261). Other
					rights and remedies also may be available to you under federal or
					other laws.
				</p>
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
}
