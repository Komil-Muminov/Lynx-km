package com.kmlynx

import android.os.Bundle
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.lynx.tasm.LynxEnv
import com.lynx.tasm.LynxView
import com.lynx.tasm.LynxViewBuilder
import java.io.InputStream

class MainActivity : AppCompatActivity() {
    private var lynxView: LynxView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 1. Создаем корневой layout
        val rootLayout = FrameLayout(this)
        rootLayout.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        setContentView(rootLayout)

        // 2. Инициализируем LynxEnv (если еще не инициализирован)
        if (!LynxEnv.inst().isInstantiated) {
            LynxEnv.inst().init(applicationContext, null, null, null)
        }

        // 3. Создаем LynxView
        lynxView = LynxViewBuilder()
            .setContext(this)
            .build()

        lynxView?.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        
        rootLayout.addView(lynxView)

        // 4. Загружаем скомпилированный бандл из assets/main.lynx.bundle
        loadLynxBundle()
    }

    private fun loadLynxBundle() {
        try {
            val inputStream: InputStream = assets.open("main.lynx.bundle")
            val bundleData = inputStream.readBytes()
            inputStream.close()
            
            // Рендерим бандл
            lynxView?.renderTemplateWithBaseUrl(bundleData, "{}", "file:///android_asset/")
        } catch (e: Exception) {
            e.printStackTrace()
            // Если файла пока нет (нужно сделать npm run build), выведется ошибка в лог
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        lynxView?.destroy()
    }
}
