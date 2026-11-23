package com.kzanntech.biblequest;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

/**
 * Atividade principal do Bible Quest.
 *
 * Orientação: retrato nos celulares; livre em tablets e telas grandes
 * (menor lado com 600 dp ou mais). No Android 16, o sistema já ignora a
 * trava de orientação nessas telas; aqui o comportamento fica igual também
 * nas versões anteriores. A orientação não reinicia a atividade
 * (configChanges no AndroidManifest.xml), então o jogo não perde o estado.
 */
public class MainActivity extends BridgeActivity {
    private static final int TELA_GRANDE_DP = 600;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ajustarOrientacao(getResources().getConfiguration());
    }

    // aparelhos dobráveis mudam de tamanho sem reiniciar a atividade
    @Override
    public void onConfigurationChanged(Configuration novaConfiguracao) {
        super.onConfigurationChanged(novaConfiguracao);
        ajustarOrientacao(novaConfiguracao);
    }

    private void ajustarOrientacao(Configuration configuracao) {
        boolean telaGrande = configuracao.smallestScreenWidthDp >= TELA_GRANDE_DP;
        setRequestedOrientation(telaGrande ? ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }
}
