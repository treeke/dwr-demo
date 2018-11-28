package com.dwr.config;

import org.directwebremoting.Browser;
import org.directwebremoting.ScriptSessions;

public class DwrPush {
	
	public static void init(String msg) {
		DwrPush.sendMsg("/dwr.html", msg);
	}
	
    public static void sendMsg(final String html,final String msg) {
      Browser.withPage(html, new Runnable() {
          public void run() {
              ScriptSessions.addFunctionCall("onDwrData", msg);
          }
      });

  }
}
