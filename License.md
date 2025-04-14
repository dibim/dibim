# DIBIM 协议 | DIBIM Agreement

## 中文版

### 第一条 协议目的

为支持符合条件的用户免费使用，规避未经授权的商业化使用，并保障本项目的持续开发，特制定本协议。

### 第二条 定义

2.1 **代码仓库**：存储源代码的仓库。

2.2 **项目名称**：**DIBIM**。

2.3 **本项目**：**DIBIM** 项目官方**代码仓库**中的源代码及其编译后的软件。官方**代码仓库**地址：

- Gitee（中国）：[https://gitee.com/dibim/dibim](https://gitee.com/dibim/dibim)
- Codeberg（德国）：[https://codeberg.org/dibim/dibim](https://codeberg.org/dibim/dibim)
- GitHub：[https://github.com/dibim/dibim](https://github.com/dibim/dibim)

2.4 **本项目的所有者**：官方**代码仓库**所有者账户的实际持有人。

2.5 **本项目的贡献者**：向**本项目**的**代码仓库**提交代码合并请求并被接受的账户（仅限个人账户）的实际持有人。

2.6 **用户**：使用**本项目**的自然人。

2.7 **重大修改**：对现有功能的实现**逻辑**有超过 75% 的实质性修改，或新增完整功能。不含**本项目**使用的第三方库，不含界面样式修改。

2.8 **衍生项目**：基于**本项目**代码，至少包含 20 处**重大修改**的项目。

2.9 **副本项目**：基于**本项目**代码，仅少量修改或无修改，不符合**衍生项目**定义的项目。

2.10 **下游项目**：基于**本项目**、**衍生项目**或**副本项目**的项目，或代码基于/可追溯至上述任一项目的项目。包含代码**逻辑**与**本项目**相似度≥50%（不含**本项目**使用的第三方库除）的项目。

### 第三条 免费授权

3.1 授权对象

3.1.1 使用**本项目**：

- **本项目的贡献者**；
- 自然人用户（用于个人独立完成的项目）；
- 以下组织的员工（用于本单位的工作）：
  - 行政机关（不含下属企事业单位及组织、机构等）；
  - 公办非营利组织，包括公立学校、公立医院、公立博物馆等；
  - 合法注册的民办非营利组织，包括慈善组织、社会服务机构等；
  - 少于 10 名**用户**的营利性组织。

3.1.2 使用**衍生项目**：

- 所有人。

3.2 授权范围：复制、修改、编译源代码，运行编译后的软件。

3.3 符合条件的授权对象可直接使用，无需**本项目的所有者**给予授权证明。

### 第四条 商业授权

4.1 授权对象：不符合第 3.1 条的所有对象。

4.1.1 若授权对象自身变化导致不符合免费条件，应在30日内购买商业授权。

4.2 授权周期：以年为单位，到期需重新购买。

4.3 价格：每**用户**每年的费用：

- 中国境内用户（含港澳台地区）：100 元人民币；
- 美国、加拿大、欧盟成员国、英国、瑞士、挪威、冰岛、日本、韩国、新加坡、以色列、澳大利亚、新西兰用户：30 美元 / 欧元 / 英镑；
- 其他国家和地区用户：15 美元 / 欧元 / 英镑。

4.4 购买商业授权后，**本项目的所有者**会给予授权证明。

### 第五条 **衍生项目**、**副本项目**及**下游项目**

5.1 **衍生项目**、**副本项目**及**下游项目**必须开源，应当在文档及网站首页注明**本项目**名称和官方网址。

5.2 **衍生项目**、**副本项目**及**下游项目**均继承本协议，在项目根目录保留本协议文件，不得修改协议内容，不得再采用其它协议。

### 第六条 禁止条款

6.1 未经**本项目的所有者**允许，禁止删除或篡改源代码及编译后的软件中的图标/版权信息/协议条款等。

6.2 未经**本项目的所有者**允许，禁止将**本项目**、**衍生项目**、**副本项目**、**下游项目**改造成任何形式的网络服务对外提供，包括但不限于 SaaS/PaaS 服务、API 服务、网络应用程序。

6.3 未经**本项目的所有者**允许，禁止售卖**本项目**、**衍生项目**、**副本项目**、**下游项目**的源代码及其编译后的软件。

### 第七条 责任

7.1 **用户**责任

7.1.1 设置主密码。

7.1.2 定期备份配置文件。

7.1.3 遵守当地法律法规及本协议条款，不得用于非法用途。

7.2 **本项目的所有者**的责任

7.2.1 **本项目的所有者**确保不故意设置后门或添加恶意程序。

7.2.2 采取安全措施保护敏感数据，包括：

- 所有配置文件均采用 **AES-GCM 算法加密**；

- 在**用户**未设置主密码的情况下，将使用默认主密码进行加密，并在每次启动软件时在显著位置提醒用户设置主密码；

- 所有对数据库的写操作均会生成 SQL 语句并在用户界面中显示，需经**用户**确认后才会执行。

7.2.3 **本项目的所有者**不承担因软件使用导致的损失（如数据丢失、系统故障），但因**故意或重大过失**（如蓄意隐瞒缺陷、欺诈行为）导致的除外。

7.2.4 在以下情形中，**本项目的所有者**不承担责任：

- **不可抗力**：如自然灾害、战争、政府行为等；
- **用户操作不当**：如误删数据、错误配置权限；
- **第三方因素**：如硬件故障、网络中断、恶意软件；
- **用户未履行义务**：如未设置主密码、未备份数据或未购买商业授权。

### 第八条 协议修订

本协议最终解释权归**本项目的所有者**所有，保留修订权利，但需确保条款不违反当地法律中的**强制性规定**（如消费者保护、数据隐私等）。

协议修订后，新代码将遵循更新后的协议，重大修订（涉及授权费用/禁止条款变更）需邮件通知现有商业授权用户。

### 第九条 协议生效

有以下任一行为即视为接受本协议：

- 复制（克隆）、修改、编译**本项目**、**衍生项目**、**副本项目**、**下游项目**的**代码仓库**源代码；

- 下载、运行**本项目**、**衍生项目**、**副本项目**、**下游项目**的可执行文件。

## English version

### Article 1 Purpose of the Agreement

This Agreement is formulated to support eligible users with free usage, prevent unauthorized commercialization, and ensure the sustainable development of this project.

### Article 2 Definitions

2.1 **Code Repository**: A repository storing source code.

2.2 **Project Name**: **DIBIM**.

2.3 **This Project**: The source code in the official **Code Repository** of the **DIBIM** project and its compiled software. Official **Code Repository** addresses:

- Gitee (China): [https://gitee.com/dibim/dibim](https://gitee.com/dibim/dibim)
- Codeberg (Germany): [https://codeberg.org/dibim/dibim](https://codeberg.org/dibim/dibim)
- GitHub: [https://github.com/dibim/dibim](https://github.com/dibim/dibim)

2.4 **Owner of This Project**: The actual holder of the account owning the official **Code Repository**.

2.5 **Contributor to This Project**: The actual holder of an account (limited to individual accounts) whose code merge requests to this project's **Code Repository** have been accepted.

2.6 **User**: A natural person using **This Project**.

2.7 **Major Modification**: Substantive modifications exceeding 75% of the implementation logic of existing features, or the addition of complete functionalities. Excludes third-party libraries used by **This Project** and interface style modifications.

2.8 **Derivative Project**: A project based on **This Project**'s code, containing at least 20 **Major Modifications**.

2.9 **Replica Project**: A project based on **This Project**'s code with minor or no modifications, not meeting the definition of a **Derivative Project**.

2.10 **Downstream Project**: A project based on **This Project**, **Derivative Project**, or **Replica Project**, or whose code originates from/traces to any of the aforementioned projects. Includes projects with code logic similarity ≥50% to **This Project** (excluding third-party libraries used by **This Project**).

### Article 3 Free License

3.1 Licensees

3.1.1 For using **This Project**:

- **Contributors to This Project**;
- Individual Users (for personally independent projects);
- Employees of the following organizations (for their institutional work):
  - Administrative agencies (excluding subordinate enterprises/institutions/organizations);
  - Public non-profit organizations (e.g., public schools, hospitals, museums);
  - Legally registered private non-profit organizations (e.g., charities, social service agencies);
  - For-profit organizations with fewer than 10 **Users**.

3.1.2 For using **Derivative Projects**:

- All entities.

3.2 Scope: Copying, modifying, compiling source code, and running compiled software.

3.3 Eligible licensees may use directly without requiring authorization proof from the **Owner of This Project**.

### Article 4 Commercial License

4.1 Licensees: All entities not meeting Article 3.1.

4.1.1 If a licensee becomes ineligible due to internal changes, commercial authorization must be purchased within 30 days.

4.2 Term: Annual basis, requiring renewal upon expiration.

4.3 Pricing (per **User** annually):

- Users in China (including Hong Kong, Macau, and Taiwan regions): 100 CNY;
- Users in the U.S., Canada, EU member states, UK, Switzerland, Norway, Iceland, Japan, South Korea, Singapore, Israel, Australia, New Zealand: 30 USD/EUR/GBP;
- Other countries/regions: 15 USD/EUR/GBP.

4.4 Authorization proof will be provided after purchase.

### Article 5 Derivative Projects, Replica Projects, and Downstream Projects

5.1 **Derivative Projects**, **Replica Projects**, and **Downstream Projects** must be open-source, explicitly stating **This Project**'s name and official URL in documentation and website headers.

5.2 All such projects inherit this Agreement, retain this Agreement file in root directories, and shall not modify the Agreement or adopt other licenses.

### Article 6 Prohibitions

6.1 Deleting or tampering with icons/copyright information/agreement terms in source code or compiled software without permission.

6.2 Converting **This Project**, **Derivative Projects**, **Replica Projects**, or **Downstream Projects** into network services (e.g., SaaS/PaaS, APIs, web apps) without permission.

6.3 Selling source code or compiled software of the aforementioned projects without permission.

### Article 7 Responsibilities

7.1 **User Responsibilities**
7.1.1 Set a master password.
7.1.2 Regularly back up configuration files.
7.1.3 Comply with local laws and this Agreement; no illegal usage.

7.2 **Owner Responsibilities**
7.2.1 No intentional backdoors or malicious programs.
7.2.2 Security measures for sensitive data:

- All configuration files encrypted via **AES-GCM**;
- Use default master password with startup reminders if unset;
- Display SQL write operations for user confirmation.

7.2.3 No liability for losses (e.g., data loss, system failures) except for **willful misconduct or gross negligence** (e.g., intentional defect concealment, fraud).

7.2.4 Exemptions for:

- **Force Majeure**: Natural disasters, wars, government actions;
- **User Errors**: Accidental data deletion, misconfigurations;
- **Third-Party Factors**: Hardware failures, network outages, malware;
- **User Non-Compliance**: Unset passwords, unbacked data, or unpaid licenses.

### Article 8 Agreement Amendments

The **Owner of This Project** retains final interpretation rights and may revise terms provided they comply with local **mandatory laws** (e.g., consumer protection, data privacy).

New code follows updated agreements. Major revisions (affecting fees/prohibitions) require email notification to commercial licensees.

### Article 9 Agreement Effectiveness

Acceptance occurs through any of:

- Copying (cloning), modifying, or compiling source code from **This Project**, **Derivative Projects**, **Replica Projects**, or **Downstream Projects**;
- Downloading or executing binaries of the aforementioned projects.

*In case of any discrepancies, the Chinese version shall prevail.*
