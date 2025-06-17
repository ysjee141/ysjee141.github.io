'use client';

import {Button, Input, Layout, Menu, Modal, theme} from "antd";
import React, {useState} from "react";
import Link from "next/link";
import './header.scss'
import {SearchOutlined} from "@ant-design/icons";

const {Header} = Layout;

const SiteHeader: React.FC = () => {
  const [searchModal, setSeearchModal] = useState(false);
  const {
    token: {colorBgContainer},
  } = theme.useToken();

  const items = [
    {
      key: '0',
      label: "Posts"
    },
    {
      key: '1',
      label: "Portfolio"
    },
    {
      key: '2',
      label: "Contact me"
    }
  ]

  const HeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    width: '100%',
    backgroundColor: colorBgContainer,
    padding: 0,
    borderBottom: `1px solid rgba(5,5,5,0.06)`,
  }

  const LogoStyle: React.CSSProperties = {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: "#000000",
  }

  const MenuStyle = {
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-end',
    fontSize: '1.6rem',
  }

  return (
    <Header style={HeaderStyle}>
      <div>
        <Link href="/" style={LogoStyle}>{"{ HAPPLOG }"}</Link>
      </div>
      <Menu
        mode="horizontal" defaultSelectedKeys={['0']}
        items={items}
        style={MenuStyle}
      ></Menu>
      <Button shape="circle"
              icon={<SearchOutlined/>}
              onClick={() => setSeearchModal(true)}
      />
      <Modal
        open={searchModal}
        onCancel={() => setSeearchModal(false)}
        footer={null}
        width={{
          xs: '90%',
          sm: '80%',
          md: '70%',
          lg: '60%',
          xl: '50%',
          xxl: '40%',
        }}
        title="Search"
      >
        <Input.Search
          placeholder="Filled" variant="filled"
          size="large"
          enterButton={
            <Button type="primary" icon={
              <SearchOutlined/>
            }></Button>
          }/>
      </Modal>
    </Header>
  )
}

export default SiteHeader